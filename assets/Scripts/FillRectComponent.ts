import { _decorator, Component, GraphicsComponent, Node, UITransformComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FillRectComponent')
export class FillRectComponent extends Component {
    @property(GraphicsComponent)
    graphics: GraphicsComponent = null;

    update() {
        const transform = this.node.getComponent(UITransformComponent);
        this.graphics.rect(-(transform.width * (1 - transform.anchorX)), -(transform.height * (1 - transform.anchorY)), 
                            transform.width, transform.height); 
        this.graphics.fill();
    }
}


