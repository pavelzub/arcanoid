import { _decorator, BoxCollider2D, ColliderComponent, Component, Node, UITransform, UITransformComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StretchComponent')
export class StretchComponent extends Component {
    @property
    stretchX: boolean = true;

    @property
    stretchY: boolean = true;

    update(deltaTime: number) {
        if (this.stretchX) {
            this.node.getComponent(UITransformComponent).width = this.node.parent.getComponent(UITransformComponent).width;
        }
        if (this.stretchY) {
            this.node.getComponent(UITransformComponent).height = this.node.parent.getComponent(UITransformComponent).height;
        }
    }
}


