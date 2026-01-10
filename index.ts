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
  puntuation: any // In the original code puntuation seems to be string or number
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

class Player {
  x: number
  y: number
  radius: number
  color: string

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
    c.fill()
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

class Enemy {
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

let dinamicScore = 0

function init() {
  player = new Player(x, y, 25, 'blue')
  projectiles = []
  enemies = []
  particles = []
  dinamicScore = 0
  score.innerHTML = dinamicScore.toString()
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min
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

    enemies.push(
      new Enemy(xCoordinate, yCoordinate, newRadius, brandColor, velocity)
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
  player.draw()

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

    // Game Over
    if (dist - enemy.radius - player.radius < 1) {
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

        if (enemy.radius - 10 > 5) {
          // Increase score
          dinamicScore += 10
          score.innerHTML = dinamicScore.toString()
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
          setTimeout(() => {
            enemies.splice(index, 1)
            projectiles.splice(shotIndex, 1)
          }, 0)
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
  projectiles.push(new Projectile(x, y, 5, 'white', velocity))
}

start.onclick = () => {
  // Start Game
  animation()
  newEnemies()
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
  userInput.onchange = () => {
    if (userInput.value !== '') {
      $('#btnSubmit').attr('disabled', 'false') // Removing attribute is better: .removeAttr('disabled') or .prop('disabled', false)
      $('#btnSubmit').removeAttr('disabled')
      if (btn) {
        btn.className =
          'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
      }
    } else {
      $('#btnSubmit').attr('disabled', 'true')
      if (btn) {
        btn.className =
          'bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed'
      }
    }
  }
}

if (namePlayer) {
  namePlayer.addEventListener('submit', (e) => {
    e.preventDefault()
    const userName = (document.getElementById('username') as HTMLInputElement)
      .value
    if (userName !== '') {
      playerId = userName
      playerName = userName
      initialSetting.playerName = playerName
    }
    namePlayer.reset()
    alert(`Your Name was Register as ${playerId}`)
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
