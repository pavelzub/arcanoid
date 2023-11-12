import { _decorator, CameraComponent, Component, Node, UITransformComponent } from 'cc';
import { PlayerController } from './PlayerController';
import { EnemiesController } from './EnemiesController';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property
    wsUrl: string = "ws://localhost:8999";

    @property(CameraComponent)
    camera: CameraComponent = null;

    @property(Node)
    gameField: Node = null;

    @property(PlayerController)
    playerController: PlayerController = null;

    @property(EnemiesController)
    enemiesController: EnemiesController = null;

    wsConnection: WebSocket = null;
    id: string = null;

    wsSend(data: string) {
        if(!this.wsConnection.readyState){
            setTimeout(()=>{
                this.wsSend(data);
            }, 100);
        } else {
            this.wsConnection.send(data);
        }
    }

    initField() {
        // this.gameField.getComponent(UITransformComponent).width = this.camera.camera.orthoHeight * this.camera.camera.aspect * 2;
    }

    initWs() {
        this.wsConnection = new WebSocket(this.wsUrl)
        this.wsConnection.onopen = function() {
            console.log("Соединение установлено.");
        };

        this.wsConnection.onclose = function(event) {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };

        this.wsConnection.onmessage = (message: MessageEvent) => {
            try {
                const data = JSON.parse(message.data);
                switch (data.event) {
                    case "PLAYER_ID":  
                        this.id = data.id;
                        break;
                    case "PLAYERS_UPDATE":
                        delete data.players[this.id];
                        this.enemiesController.updateEnemiesInfo(data.players);
                        break
                    default: 
                        console.log("Unknown event");
                }
            } catch (error) {
                console.log("Wrong message format", error);
            }
        }

        this.wsConnection.onerror = function(error) {
            console.log("Ws error");
        };
    }

    start() {
        this.initWs();
    }

    sendPlayerInfo() {
        let payload = {
            event: "PLAYER_INFO_UPDATE",
            position: this.playerController.GetPosition()
        };

        this.wsSend(JSON.stringify(payload));
    }

    update(deltaTime: number) {
        this.sendPlayerInfo();
        this.initField();    
    }
}


