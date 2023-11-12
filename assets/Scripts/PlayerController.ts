import { _decorator, Component, Node, input, Input, Vec2, Vec3, EventKeyboard, AnimationState, KeyCode, RigidBody2D, EventTouch, Camera, AnimationComponent, Prefab, BoxCollider2D, BoxColliderComponent, UITransformComponent, instantiate } from 'cc';
import { GhostPlane } from './GhostPlane';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Camera)
    camera: Camera = null;

    @property
    rotationStep = 2;

    @property
    defautGravity = 10;

    @property
    extraGravityStep = 1;

    @property
    topOffset = 20;

    @property
    speedStep = 0.1;

    @property
    maxSpeed = 10;

    @property(Vec2)
    threshold = new Vec2(10, 10);

    @property(RigidBody2D) 
    rig: RigidBody2D = null;

    @property(Node) 
    cannon: Node = null;

    @property(Prefab) 
    ghostPlanePrefab: Prefab = null;

    ghostPlane: Node = null;

    @property(AnimationComponent)
    anim: AnimationComponent = null;
    animState: AnimationState = null;

    direction = new Vec2(1, 0);
    speed = 0;
    isTouched = false;
    touchPos = new Vec2(0, 0);
    controls: Record<KeyCode, boolean>;

    isUpPressed() { return this.controls[KeyCode.ARROW_UP]; }
    isDownPressed() { return this.controls[KeyCode.ARROW_DOWN]; }
    isGoPressed() { return this.controls[KeyCode.ARROW_RIGHT]; }

    initTouches() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        // input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

        // input.on(Input.EventType.TOUCH_END, this.onToucEnd, this);
        // input.on(Input.EventType.TOUCH_CANCEL, this.onToucEnd, this);
    }

    GetPosition(): Vec3 {
        return this.node.getPosition();
    }

    start() {
        this.initTouches();
        this.initAnimation();
    }

    onTouchStart(event: EventTouch) {
        this.isTouched = true;
        this.touchPos = event.getLocation();
    }

    onTouchMove(event: EventTouch) {
        this.touchPos = event.getLocation();
    }

    onToucEnd(event: EventTouch) {
        // this.currentSpeed = new Vec2(0, 0);
        this.isTouched = false;
    }

    initAnimation() {
        if (this.anim == null) {
            return;
        }

        const animCount = this.anim.clips.length;
        const currentAnim = Math.floor(Math.random() * animCount);
        const clip = this.anim.clips[currentAnim];
        this.animState = this.anim.createState(clip);
        this.animState.play();
    }

    updateAnimation() {
        if (this.animState == null) {
            return;
        }

        this.animState.speed = this.speed;
    }

    checkTeleport() {
        const cannonTransform = this.cannon.getComponent(UITransformComponent);
        const nodeBounds = cannonTransform.getBoundingBoxToWorld().transformMat4(this.node.getParent().getWorldMatrix().clone().invert());
        const filedTransform = this.node.getParent().getComponent(UITransformComponent);

        const overLeftBound = -filedTransform.width / 2 > nodeBounds.xMin;
        const overRightBound = filedTransform.width / 2 < nodeBounds.xMax;
        console.log(nodeBounds.xMin, nodeBounds.xMax, filedTransform.width / 2);
        if (!overLeftBound && !overRightBound) {
            return;
        }

        const offset = overRightBound ? -filedTransform.width : filedTransform.width;
        this.node.setPosition(new Vec3(this.node.getPosition().x + offset, this.node.getPosition().y, this.node.getPosition().z));
    }

    updateGhostPlane() {
        const nodeTransform = this.node.getComponent(UITransformComponent);
        const filedTransform = this.node.getParent().getComponent(UITransformComponent);
        const nodeBounds = nodeTransform.getBoundingBox();

        const overLeftBound = -filedTransform.width / 2 > nodeBounds.xMin;
        const overRightBound = filedTransform.width / 2 < nodeBounds.xMax;

        if (!overLeftBound && !overRightBound) {
            if (this.ghostPlane) {
                this.ghostPlane.destroy();
                this.ghostPlane = null;
            }
            return;
        }

        if (!this.ghostPlane) {
            this.ghostPlane = instantiate(this.ghostPlanePrefab);
            this.ghostPlane.setParent(this.node.getParent());
            this.ghostPlane.getComponent(GhostPlane).init(this);
        }

        const offset = overRightBound ? -filedTransform.width : filedTransform.width;
        this.ghostPlane.getComponent(GhostPlane).setOffset(new Vec3(offset));
    }

    checkTopBound() {
        const nodeTransform = this.node.getComponent(UITransformComponent);
        const filedTransform = this.node.getParent().getComponent(UITransformComponent);

        const nodeBounds = nodeTransform.getBoundingBox();

        const overTopBound = nodeBounds.yMax + this.topOffset - filedTransform.height / 2;

        this.rig.gravityScale = overTopBound > 0 ? this.extraGravityStep * overTopBound : this.defautGravity;
    }

    updateVelocity() {
        if (this.rig == null) {
            return;
        }

        if (this.isDownPressed) {
            this.direction.rotate(-Math.PI / 180 * this.rotationStep);
        }
        if (this.isUpPressed) {
            this.direction.rotate(Math.PI / 180 * this.rotationStep);
        }
        if (this.isGoPressed) {
            this.speed = Math.min(this.speed + this.speedStep, this.maxSpeed);
        }
        
        this.node.setRotationFromEuler(0, 0, -this.direction.signAngle(new Vec2(1, 0)) / Math.PI * 180);
        this.rig.linearVelocity = this.direction.clone().multiplyScalar(this.speed);

        // if (this.isTouched) {
        //     let nodePos = this.camera.worldToScreen(this.node.worldPosition);
        //     let delta = new Vec2(this.touchPos);
        //     delta.subtract2f(nodePos.x, nodePos.y);

        //     let maxDelta = Math.max(Math.abs(delta.x), Math.abs(delta.y));
        //     delta.divide2f(maxDelta, maxDelta);

        //     this.currentSpeed.x = maxDelta > this.threshold.x ? this.speed.x * delta.x : 0;
        //     this.currentSpeed.y = maxDelta > this.threshold.y ? this.speed.y * delta.y : 0;
        // }

        // this.rig.linearVelocity = this.currentSpeed;
    }

    onKeyDown(event: EventKeyboard) {
        this.controls[event.keyCode] = true;

        this.onKeyPressing(event);
    }

    onKeyUp(event) {
        this.controls[event.keyCode] = false;
    }

    onKeyPressing(event: EventKeyboard) {
    }

    update(dt) {
        this.updateVelocity();
        this.checkTopBound();
        this.updateAnimation();
        this.checkTeleport();
        this.updateGhostPlane();

        if (!this.isGoPressed()) {
            this.speed = Math.max(0, this.speed - this.speedStep);
        }
    }
}


