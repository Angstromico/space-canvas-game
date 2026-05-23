import $ from 'jquery'
import { gsap } from 'gsap'

const canvas = document.querySelector('canvas')!
const c = canvas.getContext('2d')!

canvas.width = innerWidth
canvas.height = innerHeight

const score = document.getElementById('score')!
const start = document.getElementById('start')!
const initial = document.getElementById('initial')!
const score2 = document.getElementById('score2')!

// UI for Lives
const livesContainer = document.createElement('div')
livesContainer.id = 'lives-container'
livesContainer.className =
  'fixed text-white ml-2 mt-8 select-none text-xl font-bold'
document.body.appendChild(livesContainer)

// Type definitions for audio elements
const mainMusic = document.getElementById('main') as HTMLAudioElement
const pauseSong = document.getElementById('pause') as HTMLAudioElement
const overSong = document.getElementById('over') as HTMLAudioElement
const hitSound = document.getElementById('impact') as HTMLAudioElement
const laserSound = document.getElementById('laser') as HTMLAudioElement
const destructionSound = document.getElementById(
  'destruction'
) as HTMLAudioElement

let time: number = 2500
let musicGame: boolean = true
let soundsEffects: boolean = true

const showList = document.getElementById('show-list')!

interface ScoreEntry {
  name: string
  puntuation: any
}

interface PlayerSettings {
  music: boolean
  sounds: boolean
  playerName: string
  scorePoints: number | string
  difficulty: number
}

// Check LocalStorage
let localInfo: ScoreEntry[] = JSON.parse(
  localStorage.getItem('points') || 'null'
)
let localSettings: PlayerSettings = JSON.parse(
  localStorage.getItem('player-settings') || 'null'
)

const initialSetting: PlayerSettings = localSettings || {
  music: true,
  sounds: true,
  playerName: '',
  scorePoints: 0,
  difficulty: time,
}

let { music, sounds, playerName, scorePoints, difficulty } = initialSetting
let playerId: string | undefined = playerName

const updatePilotDisplay = () => {
  const display = document.getElementById('current-pilot-display')
  if (display) {
    display.textContent = (playerId && playerId.trim() !== '' ? playerId : 'RECRUIT').toUpperCase()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (localInfo) {
    showList.classList.remove('hide')
  } else {
    showList.classList.add('hide')
  }

  if (localSettings) {
    const { scorePoints, music, sounds, playerName, difficulty } = localSettings

    if (Number(scorePoints) > 0) {
      score2.innerHTML = scorePoints.toString()
    }
    if (!music) {
      ;(document.querySelector('.no') as HTMLElement)?.click()
    }
    if (!sounds) {
      ;(document.getElementById('sounds-off') as HTMLElement)?.click()
      ;(document.getElementById('sounds-off') as HTMLElement)?.click()
    }
    if (playerName) {
      playerId = playerName
    }
    if (difficulty === 4000) {
      ;(levels[0] as HTMLElement).click()
    } else if (difficulty === 2500) {
      ;(levels[1] as HTMLElement).click()
    } else if (difficulty === 1000) {
      ;(levels[2] as HTMLElement).click()
    }
  }
  updatePilotDisplay()
})

const burger = document.querySelector('.animated-icon1') as HTMLElement
const arrowBurguer = document.querySelector('.navbar-brand') as HTMLElement

if (burger) {
  burger.onclick = () => {
    const form = document.querySelector('form')
    form?.classList.toggle('toggle-form')
  }
}

if (arrowBurguer) {
  arrowBurguer.onclick = (e) => {
    e.preventDefault()
    burger.click()
  }
}

$(document).ready(function () {
  $('.first-button').on('click', function () {
    $('.animated-icon1').toggleClass('open')
  })
  $('.second-button').on('click', function () {
    $('.animated-icon2').toggleClass('open')
  })
  $('.third-button').on('click', function () {
    $('.animated-icon3').toggleClass('open')
  })
})

interface Velocity {
  x: number
  y: number
}

// PowerUp Types
type PowerUpType = 'RapidFire' | 'Shield'

class PowerUp {
  x: number
  y: number
  radius: number
  color: string
  type: PowerUpType
  image: HTMLImageElement | null // Placeholder for future images

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x
    this.y = y
    this.radius = 15
    this.type = type
    this.color = type === 'RapidFire' ? 'red' : 'cyan'
    this.image = null
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()

    // Text label
    c.fillStyle = 'white'
    c.font = '10px Arial'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(this.type === 'RapidFire' ? 'RF' : 'SH', this.x, this.y)
  }

  update() {
    this.draw()
    // Slowly move down or float? Let's just float
  }
}

class Player {
  x: number
  y: number
  radius: number
  color: string
  isInvulnerable: boolean = false
  activePowerUp: PowerUpType | null = null
  powerUpTimer: any = null

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color

    // Visual feedback for invulnerability
    if (this.isInvulnerable) {
      c.globalAlpha = 0.5
      if (Math.floor(Date.now() / 100) % 2 === 0) {
        c.fillStyle = 'white'
      }
    }

    c.fill()
    c.globalAlpha = 1.0 // Reset alpha

    // Shield Visual
    if (this.activePowerUp === 'Shield') {
      c.beginPath()
      c.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2, false)
      c.strokeStyle = 'cyan'
      c.lineWidth = 3
      c.stroke()
    }
  }

  activatePowerUp(type: PowerUpType) {
    this.activePowerUp = type
    if (this.powerUpTimer) clearTimeout(this.powerUpTimer)

    this.powerUpTimer = setTimeout(() => {
      this.activePowerUp = null
    }, 5000) // 5 seconds duration
  }
}

class Projectile {
  x: number
  y: number
  radius: number
  color: string
  speed: Velocity

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    speed: Velocity
  ) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.speed = speed
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.speed.x
    this.y = this.y + this.speed.y
  }
}

// Enemy Types
type EnemyType = 'Normal' | 'Homing' | 'Tank'

class Enemy {
  x: number
  y: number
  radius: number
  color: string
  speed: Velocity
  type: EnemyType
  health: number

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    speed: Velocity,
    type: EnemyType = 'Normal'
  ) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.speed = speed
    this.type = type

    // Tank has more health/size, Homing is weak
    if (this.type === 'Tank') {
      this.health = 5
      this.color = 'green'
      this.speed.x *= 0.5
      this.speed.y *= 0.5
    } else if (this.type === 'Homing') {
      this.health = 1
      this.color = 'yellow'
      // Homing is fast usually, but logic is in update
    } else {
      this.health = 1
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()

    if (this.type === 'Homing') {
      // Recalculate velocity towards player
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      // Homing speed
      const speedMultiplier = 1.5
      this.x += Math.cos(angle) * speedMultiplier
      this.y += Math.sin(angle) * speedMultiplier
    } else {
      this.x = this.x + this.speed.x
      this.y = this.y + this.speed.y
    }
  }
}

const friction = 0.98

class BluePrint {
  x: number
  y: number
  radius: number
  color: string
  speed: Velocity
  alpha: number

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    speed: Velocity
  ) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.speed = speed
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.speed.x *= friction
    this.speed.y *= friction
    this.x = this.x + this.speed.x
    this.y = this.y + this.speed.y
    this.alpha -= 0.01
  }
}

class FloatingText {
  x: number
  y: number
  text: string
  color: string
  life: number
  alpha: number
  velocity: Velocity

  constructor(x: number, y: number, text: string, color: string) {
    this.x = x
    this.y = y
    this.text = text
    this.color = color
    this.life = 60 // Frames to live
    this.alpha = 1
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: -2, // Move up
    }
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.font = 'bold 20px Arial'
    c.fillStyle = this.color
    c.fillText(this.text, this.x, this.y)
    c.restore()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.life--
    this.alpha = this.life / 60
  }
}

class BackgroundParticle {
  x: number
  y: number
  radius: number
  color: string
  velocity: Velocity

  constructor() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.radius = Math.random() * 2
    this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`
    this.velocity = {
      x: 0,
      y: Math.random() * 0.5 + 0.1,
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.y += this.velocity.y
    if (this.y > canvas.height) {
      this.y = 0
      this.x = Math.random() * canvas.width
    }
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

let dX = x
let dY = y
let player = new Player(x, y, 25, 'blue')

const setColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  const newColor = '#' + randomColor
  return newColor
}

let projectiles: Projectile[] = []
let enemies: Enemy[] = []
let particles: BluePrint[] = []
let powerUps: PowerUp[] = []
let floatingTexts: FloatingText[] = []
let backgroundStars: BackgroundParticle[] = []

let dinamicScore = 0
let lives = 3

function updateLivesUI() {
  livesContainer.innerHTML = `LIVES: ${'❤️'.repeat(lives)}`
}

function createScoreLabel(
  x: number,
  y: number,
  score: number | string,
  color: string = 'white'
) {
  const text = typeof score === 'number' ? `+${score}` : score
  floatingTexts.push(new FloatingText(x, y, text as string, color))
}

function init() {
  player = new Player(x, y, 25, 'blue')
  projectiles = []
  enemies = []
  particles = []
  powerUps = []
  floatingTexts = []
  backgroundStars = []
  // Create stars
  for (let i = 0; i < 100; i++) {
    backgroundStars.push(new BackgroundParticle())
  }

  dinamicScore = 0
  lives = 3
  score.innerHTML = dinamicScore.toString()
  updateLivesUI()
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function spawnPowerUps() {
  setInterval(() => {
    // Spawn chance every 10 seconds (or logic based on time)
    // Let's just spawn randomly for now
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const type: PowerUpType = Math.random() < 0.5 ? 'RapidFire' : 'Shield'
    powerUps.push(new PowerUp(x, y, type))

    // Remove after 10s if not picked up
    setTimeout(() => {
      const idx = powerUps.findIndex((p) => p.x === x && p.y === y)
      if (idx > -1) powerUps.splice(idx, 1)
    }, 10000)
  }, 15000) // Every 15 seconds
}

function newEnemies() {
  setInterval(() => {
    const newRadius = getRandomArbitrary(4, 60)
    let xCoordinate
    let yCoordinate

    if (Math.random() < 0.5) {
      xCoordinate =
        Math.random() < 0.5 ? 0 - newRadius : canvas.width + newRadius
      yCoordinate = Math.random() * canvas.height
    } else {
      xCoordinate = Math.random() * canvas.width
      yCoordinate =
        Math.random() < 0.5 ? 0 - newRadius : canvas.height + newRadius
    }

    const brandColor = setColor()
    const positionX = x - xCoordinate
    const positionY = y - yCoordinate
    const angle = Math.atan2(positionY, positionX)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    // Determine Enemy Type
    const rand = Math.random()
    let type: EnemyType = 'Normal'
    if (rand < 0.2) type = 'Homing' // 20% chance
    else if (rand < 0.35) type = 'Tank' // 15% chance

    enemies.push(
      new Enemy(xCoordinate, yCoordinate, newRadius, brandColor, velocity, type)
    )
  }, difficulty)
}

let animationID: number

function animation() {
  if (musicGame) {
    if (mainMusic) mainMusic.play()
  }

  if (pauseSong) pauseSong.pause()

  animationID = requestAnimationFrame(animation)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Draw Stars
  backgroundStars.forEach((star) => star.update())

  player.draw()

  // Floating Text Update
  floatingTexts.forEach((text, index) => {
    text.update()
    if (text.life <= 0) {
      floatingTexts.splice(index, 1)
    }
  })

  // PowerUp Logic
  powerUps.forEach((powerUp, index) => {
    powerUp.update()
    const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)
    if (dist - player.radius - powerUp.radius < 1) {
      // Pick up
      player.activatePowerUp(powerUp.type)
      createScoreLabel(powerUp.x, powerUp.y, powerUp.type, 'cyan')
      powerUps.splice(index, 1)
      // TODO: Play powerup sound
    }
  })

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, shotIndex) => {
    projectile.update()

    if (projectile.x - projectile.radius < 0) {
      setTimeout(() => {
        projectiles.splice(shotIndex, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, index) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // Collision Player-Enemy
    if (dist - enemy.radius - player.radius < 1) {
      if (!player.isInvulnerable && player.activePowerUp !== 'Shield') {
        lives--
        updateLivesUI()
        createScoreLabel(player.x, player.y, '-1 Life', 'red')

        // Visual hit effect (red flash)
        c.save()
        c.fillStyle = 'rgba(255, 0, 0, 0.5)'
        c.fillRect(0, 0, canvas.width, canvas.height)
        c.restore()

        if (lives <= 0) {
          // Game Over
          if (soundsEffects) {
            if (overSong) overSong.play()
          }
          if (mainMusic) mainMusic.pause()
          cancelAnimationFrame(animationID)
          initial.style.display = 'flex'
          score2.innerHTML = score.innerHTML
          start.textContent = 'RESTART THE GAME'
          init()
          scorePoints = score2.innerHTML
          initialSetting.scorePoints = scorePoints
          savePlayerName(Number(score2.innerHTML))
        } else {
          if (soundsEffects) {
            // Maybe a hurt sound here? Using impact for now
            if (hitSound) {
              hitSound.currentTime = 0
              hitSound.play()
            }
          }
          // Trigger Invulnerability
          player.isInvulnerable = true
          setTimeout(() => {
            player.isInvulnerable = false
          }, 2000) // 2 seconds invulnerability

          // Clear the enemy that hit us
          setTimeout(() => {
            enemies.splice(index, 1)
          }, 0)

          // Push back nearby enemies slightly (optional feel-good mechanic)
          enemies.forEach((e) => {
            const d = Math.hypot(player.x - e.x, player.y - e.y)
            if (d < 300) {
              // Push away
              const angle = Math.atan2(e.y - player.y, e.x - player.x)
              e.x += Math.cos(angle) * 50
              e.y += Math.sin(angle) * 50
            }
          })
        }
      } else if (player.activePowerUp === 'Shield') {
        // Shield active, destroy enemy without getting hurt
        if (soundsEffects) {
          if (destructionSound) {
            destructionSound.currentTime = 0
            destructionSound.play()
          }
        }
        enemies.splice(index, 1)
        // Visual shield hit effect?
      }
    }

    projectiles.forEach((projectile, shotIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // Projectile hit the enemy
      if (
        dist - enemy.radius + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y + projectile.radius > canvas.height
      ) {
        // Explosions
        if (soundsEffects) {
          if (hitSound.paused) {
            hitSound.play()
          } else {
            hitSound.pause()
            hitSound.currentTime = 0
            hitSound.play()
          }
        }

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new BluePrint(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          )
        }

        if (enemy.radius - 10 > 5 && enemy.health <= 0) {
          // Should check health logic if tank?
          // Logic update: Tanks take hits
          // If tank has health, reduce it and don't destroy yet
        }

        // Custom logic for tank health inside collision:
        if (enemy.type === 'Tank' && enemy.health > 1) {
          enemy.health--
          createScoreLabel(enemy.x, enemy.y, 'Hit!', 'white')
          gsap.to(enemy, {
            radius: enemy.radius - 5,
          })
          // Don't destroy enemy, just projectile
          setTimeout(() => {
            projectiles.splice(shotIndex, 1)
          }, 0)
        } else {
          // Normal destroy or Tank destroyed
          if (enemy.radius - 10 > 5) {
            // Increase score
            dinamicScore += 10
            score.innerHTML = dinamicScore.toString()
            createScoreLabel(enemy.x, enemy.y, '+10', 'white')
            gsap.to(enemy, {
              radius: enemy.radius - 5,
            })
            setTimeout(() => {
              projectiles.splice(shotIndex, 1)
            }, 0)
          } else {
            if (soundsEffects) {
              if (destructionSound) destructionSound.play()
            }

            // Increase score
            dinamicScore += 20
            score.innerHTML = dinamicScore.toString()
            createScoreLabel(enemy.x, enemy.y, '+20', 'gold')
            setTimeout(() => {
              enemies.splice(index, 1)
              projectiles.splice(shotIndex, 1)
            }, 0)
          }
        }
      }
    })
  })
}

canvas.onclick = (e) => {
  if (soundsEffects) {
    if (laserSound.paused) {
      laserSound.play()
    } else {
      laserSound.pause()
      laserSound.currentTime = 0
      laserSound.play()
    }
  }

  const positionX = e.clientX - x
  const positionY = e.clientY - y
  const angle = Math.atan2(positionY, positionX)
  const velocity = {
    x: Math.cos(angle) * 3,
    y: Math.sin(angle) * 3,
  }

  // Rapid Fire Logic (Dual Shot)
  if (player.activePowerUp === 'RapidFire') {
    // Shot 1 (Offset left)
    projectiles.push(new Projectile(x - 10, y, 5, 'red', velocity))
    // Shot 2 (Offset right)
    projectiles.push(new Projectile(x + 10, y, 5, 'red', velocity))
  } else {
    projectiles.push(new Projectile(x, y, 5, 'white', velocity))
  }
}

start.onclick = () => {
  // Start Game
  animation()
  newEnemies()
  spawnPowerUps()
  initial.style.display = 'none'
}

// Pause the game with keyboard
document.addEventListener('keypress', (e) => {
  if (mainMusic) mainMusic.pause()
  if (musicGame) {
    /* const pauseSong = document.getElementById('pause'); // Defined globally */
  }

  const key = e.key

  if (key === 'Enter' || key === 'Escape' || key === 'Tab' || key === ' ') {
    if (musicGame) {
      if (pauseSong) pauseSong.play()
    }
    cancelAnimationFrame(animationID)
    initial.style.display = 'flex'
    score2.innerHTML = score.innerHTML
    if (start.textContent !== 'START GAME') {
      start.textContent = 'START AGAIN'
    }
  }

  // Moving player with keyboard
  if (key === 'ArrowUp' || key === 'w') {
    dY -= 1
    player = new Player(dX, dY, 25, 'blue')
  }
  if (key === 'ArrowDown' || key === 's') {
    dY += 1
    player = new Player(dX, dY, 25, 'blue')
  }
  if (key === 'ArrowLeft' || key === 'a') {
    dX -= 1
    player = new Player(dX, dY, 25, 'blue')
  }
  if (key === 'ArrowRight' || key === 's') {
    dX += 1
    player = new Player(dX, dY, 25, 'blue')
  }
})

// Toggle sounds Effect and Music
const sound = document.querySelector('.sound') as HTMLElement
const noSound = document.querySelector('.no') as HTMLElement
const soundsOff = document.getElementById('sounds-off') as HTMLElement

if (sound) {
  sound.onclick = () => {
    if (
      !sound.classList.contains('chosen') &&
      noSound.classList.contains('chosen')
    ) {
      sound.classList.add('chosen')
      noSound.classList.remove('chosen')
      musicGame = true
      music = true
      initialSetting.music = music
    }
  }
}

if (noSound) {
  noSound.onclick = () => {
    if (
      sound.classList.contains('chosen') &&
      !noSound.classList.contains('chosen')
    ) {
      sound.classList.remove('chosen')
      noSound.classList.add('chosen')
      musicGame = false
      music = false
      initialSetting.music = music
    }
  }
}

if (soundsOff) {
  soundsOff.onclick = () => {
    if (soundsOff.textContent === 'DISABLE AMBIENT SOUNDS') {
      soundsOff.textContent = 'ACTIVATE AMBIENT SOUNDS'
      soundsEffects = false
      sounds = false
      initialSetting.sounds = sounds
    } else {
      soundsOff.textContent = 'DISABLE AMBIENT SOUNDS'
      soundsEffects = true
      sounds = true
      initialSetting.sounds = sounds
    }
  }
}

// Change Difficulty Level
const levels = document.querySelectorAll('.inner-levels')

const levelChange = (element: Element, index: number) => {
  const text = element.textContent
  if (text === 'EASY') {
    time = 4000
    difficulty = 4000
    initialSetting.difficulty = difficulty
  } else if (text === 'NORMAL') {
    time = 2500
    difficulty = 2500
    initialSetting.difficulty = difficulty
  } else if (text === 'HARD') {
    time = 1000
    difficulty = 1000
    initialSetting.difficulty = difficulty
  }

  if (index === 0 && !element.classList.contains('level-chosen')) {
    element.classList.add('level-chosen')
    levels[1].classList.remove('level-chosen')
    levels[2].classList.remove('level-chosen')
  } else if (index === 1 && !element.classList.contains('level-chosen')) {
    element.classList.add('level-chosen')
    levels[0].classList.remove('level-chosen')
    levels[2].classList.remove('level-chosen')
  } else if (index === 2 && !element.classList.contains('level-chosen')) {
    element.classList.add('level-chosen')
    levels[0].classList.remove('level-chosen')
    levels[1].classList.remove('level-chosen')
  } else if (index === 1 && !element.classList.contains('level-chosen')) {
    element.classList.add('level-chosen')
    levels[0].classList.remove('level-chosen')
    levels[2].classList.remove('level-chosen')
  }
}

levels.forEach((level, index) => {
  ;(level as HTMLElement).onclick = () => levelChange(level, index)
})

// Toggle Score List
const toggleScore = (element: string) => {
  $(element).toggle('slow')
}

let show = true

showList.onclick = () => {
  toggleScore('.toggle')
  show = !show
  if (show) {
    showList.textContent = 'Show List'
  } else {
    showList.textContent = 'Hide List'
  }
}

// Create a List of better Puntuations on the game
const betterPuntuations = (arr: ScoreEntry[], max: number = arr.length) =>
  arr.sort((a, b) => b.puntuation - a.puntuation).slice(0, max)

const resultsContainer = document.getElementById('inner')!

const generateResults = (maxEntries: number) => {
  let newArray: ScoreEntry[] = []
  if (localInfo) {
    newArray = betterPuntuations(localInfo, maxEntries)
    return newArray
  }
  return [] // Return empty array if no localInfo
}

const results = generateResults(5)
const resultsTotals = generateResults(localInfo ? localInfo.length : 0)

let condition = false

const resultsOnDOM = (arr: ScoreEntry[]) => {
  resultsContainer.innerHTML = ''
  arr.forEach((element) => {
    const { name, puntuation } = element
    const li = document.createElement('LI')
    li.className = 'flex justify-evenly '
    const p1 = document.createElement('P')
    p1.className = 'flex justify-between borders'
    const p2 = document.createElement('P')
    p2.className = 'flex justify-between borders'
    const span1 = document.createElement('SPAN')
    span1.className = 'inner-p border-solid md:border-dotted'
    span1.innerHTML = `Name: `
    const span2 = document.createElement('SPAN')
    span2.innerHTML = ` ${name}`
    span2.className = 'inner-p border-solid md:border-dotted'
    const span3 = document.createElement('SPAN')
    span3.innerHTML = `Score: `
    span3.className = 'inner-p border-solid md:border-dotted'
    const span4 = document.createElement('SPAN')
    span4.innerHTML = ` ${puntuation}`
    span4.className = 'inner-p border-solid md:border-dotted'
    p1.append(span1, span2)
    p2.append(span3, span4)
    li.append(p1, p2)
    resultsContainer.append(li)
  })
}

resultsOnDOM(results)

// Show the whole list
const showButton = document.getElementById('show-all')!

const activateShowing = (element: HTMLElement) => {
  if (localInfo && localInfo.length > 5) {
    element.style.display = 'flex'
  } else {
    element.style.display = 'none'
  }
}

activateShowing(showButton as HTMLElement)

const changeList = () => {
  condition = !condition
  if (!condition) {
    resultsOnDOM(results)
    showButton.textContent = 'SHOW ALL RESULTS'
  } else {
    resultsOnDOM(resultsTotals)
    showButton.textContent = 'SHOW 5 BEST ONLY'
  }
}

showButton.onclick = () => changeList()

// Create User
// Diactivate submit
$('#btnSubmit').attr('disabled', 'true') // jQuery expects string or boolean, usually string for attributes in some versions but bool is better. Fixed to string just in case or boolean. Actually .attr('disabled', true) is fine.
const btn = document.getElementById('btnSubmit') as HTMLButtonElement // Fixed element type

// Activate/Disactivate submit button on change
const userInput = document.getElementById('username') as HTMLInputElement
const namePlayer = document.getElementById('register') as HTMLFormElement

if (userInput) {
  userInput.oninput = () => {
    if (userInput.value.trim() !== '') {
      $('#btnSubmit').removeAttr('disabled')
      if (btn) {
        btn.className =
          'w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl font-orbitron tracking-widest text-xs uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300'
      }
    } else {
      $('#btnSubmit').attr('disabled', 'true')
      if (btn) {
        btn.className =
          'w-full bg-slate-800 text-slate-500 font-bold py-2.5 px-4 rounded-xl opacity-50 cursor-not-allowed font-orbitron tracking-widest text-xs uppercase'
      }
    }
  }
}

if (namePlayer) {
  namePlayer.addEventListener('submit', (e) => {
    e.preventDefault()
    const userName = (document.getElementById('username') as HTMLInputElement)
      .value
    if (userName.trim() !== '') {
      playerId = userName
      playerName = userName
      initialSetting.playerName = playerName
      updatePilotDisplay()
    }
    namePlayer.reset()
    if (btn) {
      btn.className =
        'w-full bg-slate-800 text-slate-500 font-bold py-2.5 px-4 rounded-xl opacity-50 cursor-not-allowed font-orbitron tracking-widest text-xs uppercase'
      $('#btnSubmit').attr('disabled', 'true')
    }
    // Show a beautiful custom feedback modal or update HUD name!
    alert(`Your callsign is registered as: ${playerId}`)
  })
}

function savePlayerName(puntuation: number | string) {
  let information: ScoreEntry
  if (playerId) {
    information = {
      name: playerId,
      puntuation,
    }
    if (!localInfo) {
      localStorage.setItem('points', JSON.stringify([information]))
      return
    }
    localInfo.push(information)
    localStorage.setItem('player-settings', JSON.stringify(initialSetting))
    localStorage.setItem('points', JSON.stringify(localInfo))
    document.location.reload()
  }
}
