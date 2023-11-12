import { _decorator, Component, AnimationState, AnimationComponent, Node, Vec3 } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('GhostPlane')
export class GhostPlane extends Component {
    animState: AnimationState = null;
    player: PlayerController = null;
    offset: Vec3 = new Vec3(0, 0);

    updatePosition() {
        if (this.animState && this.player && this.player.animState) {
            this.animState.setTime(this.player.animState.time);
            this.animState.speed = this.player.animState.speed;
        }
        this.node.setPosition(this.player.node.getPosition().clone().add(this.offset));
        this.node.setRotation(this.player.node.getRotation());
    }

    init(player: PlayerController) {
        const anim = this.getComponent(AnimationComponent);

        this.player = player;
        this.animState = anim.createState(player.animState.clip);
        this.animState.play();
    }

    setOffset(offset: Vec3) {
        this.offset = offset;
        this.updatePosition();
    }

    update(deltaTime: number) {
        this.updatePosition();
    }
}


