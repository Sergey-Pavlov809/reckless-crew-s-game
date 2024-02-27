import { EventEmitter } from '../EventEmitter/EventEmitter'
import { State } from '../State/State'
import { Loop } from '../Loop/Loop'
import { View } from '../View/View'
import { type Entity } from '../../entities/Entity/Entity'
import { Scenario, ScenarioEvent } from '../Scenario/Scenario'
import { type Controller } from '../Controller/typings'
import {
  BindingConfig,
  KeyBindingsArrows,
  KeyBindingsWasd,
  PointerBindings,
} from '../Controller/KeyBindings'
import { ControllerManager } from '../Controller/ControllerManager'
import { ControllerKeyboard } from '../Controller/ControllerKeyboard'
import { ControllerPointer } from '../Controller/ControllerPointer'
import { Zone } from '../Zone/Zone'
import { Resources, ResourcesEvent } from '../Resources/Resources'
import { ControllerEvent } from '../Controller/data'
import { UIElement } from '../../entities/UIElement/UIElement'
import { Color } from '../View/colors'
import { AudioManager } from '../AudioManager/AudioManager'
import { GameEvents, StatisticsData } from './data'

export class Game extends EventEmitter {
  static __instance: Game
  state: State
  resources: Resources
  loop: Loop
  view: View
  zone: Zone
  scenario: Scenario | undefined
  controllerAll: Controller
  controllerPlayerOne: Controller
  controllerPlayerTwo: Controller
  audioManager: AudioManager

  scenarioInit: boolean
  sessionElapsedTime = 0

  pausaEntity: UIElement | null

  private constructor() {
    super()
    this.state = new State()
    this.resources = new Resources(this)
    this.loop = new Loop()
    this.view = new View(this)
    this.zone = new Zone(this)
    this.controllerAll = this.createController({
      ...KeyBindingsWasd,
      ...KeyBindingsArrows,
    })
    this.controllerPlayerOne = this.createController(KeyBindingsWasd)
    this.controllerPlayerTwo = new ControllerKeyboard(KeyBindingsArrows)
    this.audioManager = new AudioManager(this)
    this.scenarioInit = false
    this.pausaEntity = null
  }

  static create(): Game {
    if (!Game.__instance) {
      Game.__instance = new Game()
    }
    return Game.__instance
  }

  init(root: HTMLElement | null): void {
    this.scenarioInit = false
    this.unload()
    this.load(root)

    this.resources.on(ResourcesEvent.Loaded, () => {
      this.initScenario()
    })
  }

  initScenario(): void {
    if (this.scenarioInit) return

    this.scenarioInit = true

    /** Инициализируем инстанс сценария */
    this.scenario = new Scenario(this)
      .on(ScenarioEvent.GameStarted, async () => {
        //Игра начата
        this.audioManager.emit('levelIntro')
        this.sessionElapsedTime = new Date().getTime()
      })
      .on(ScenarioEvent.GameOver, async () => {
        //Игра закончена
        this.sessionElapsedTime = new Date().getTime() - this.sessionElapsedTime
        this.emit(GameEvents.UpdateLeaderboard, {
          score: this.state.playerOne.score + this.state.playerTwo.score,
          hasPlayerWon: false,
          time: this.sessionElapsedTime,
        })
      })
      .on(ScenarioEvent.MissionAccomplished, async () => {
        //Уровень пройден
        this.sessionElapsedTime = new Date().getTime() - this.sessionElapsedTime
        this.emit(GameEvents.UpdateLeaderboard, {
          score: this.state.playerOne.score + this.state.playerTwo.score,
          hasPlayerWon: true,
          time: this.sessionElapsedTime,
        })
      })

    this.controllerAll
      .offAll(ControllerEvent.Pause)
      .on(ControllerEvent.Pause, () => {
        this.togglePause()
        //entity.stop()
      })
      .offAll(ControllerEvent.Fullscreen)
      .on(ControllerEvent.Fullscreen, () => {
        this.view.toggleFullScreen()
      })
  }

  load(root: HTMLElement | null): void {
    this.state.load()
    this.resources.load()
    this.loop.load()
    this.view.load(root)
    this.controllerAll.load()
    this.controllerPlayerOne.load()
    this.controllerPlayerTwo.load()
    this.audioManager.load()
  }

  unload(): void {
    this.state.unload()
    this.loop.unload()
    this.view.unload()
    this.zone.unload()
    this.controllerAll.unload()
    this.controllerPlayerOne.unload()
    this.controllerPlayerTwo.unload()
    this.audioManager.unload()
  }

  reset(): void {
    if (this.scenario) {
      delete this.scenario
    }
    this.state.reset()
    this.loop.reset()
    this.view.reset()
    this.zone.reset()
    this.controllerAll.reset()
    this.controllerPlayerOne.reset()
    this.controllerPlayerTwo.reset()
    this.audioManager.reset()
  }

  addEntity(entity: Entity): void {
    this.loop.add(entity)
    this.view.add(entity)
    this.zone.add(entity)
    this.audioManager.add(entity)
  }

  private createController(keyBinding: BindingConfig): ControllerManager {
    return new ControllerManager([
      new ControllerKeyboard(keyBinding),
      new ControllerPointer({
        pointerBindings: PointerBindings,
        type: 'mouse',
      }),
    ])
  }

  togglePause(newState: boolean | null = null): void {
    if (!this.state.inited || !this.scenario) {
      return
    }

    if (!this.pausaEntity) {
      this.pausaEntity = new UIElement({
        posX: this.scenario.mapManager.width * 2 - 15,
        posY: this.scenario.mapManager.height * 2 - 5,
        width: 30,
        height: 10,
        color: Color.White,
        align: 'center',
        text: 'ПАУЗА',
      })
    }

    if (newState === false || this.state.paused) {
      this.loop.start()
      this.controllerPlayerOne.load()
      this.controllerPlayerTwo.load()
      this.view.eraseFromLayer(this.pausaEntity, 'overlay')
    } else if (newState === true || !this.state.paused) {
      this.loop.stop()
      this.controllerPlayerOne.unload()
      this.controllerPlayerTwo.unload()
      this.view.drawTextOnLayer(this.pausaEntity, 'overlay')
    }
    this.state.paused = !this.state.paused
    this.audioManager.emit('pause', this.state.paused)
  }

  /** Эмитит событие с данными, которое отлавливается на странице с игрой для обновления лидерборда. */
  updateLeaderboard(data: StatisticsData): void {
    this.emit(GameEvents.UpdateLeaderboard, data)
  }
}