import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemiesController')
export class EnemiesController extends Component {
    @property(Node)
    gameField: Node = null;

    @property(Prefab)
    enemyPrefab: Prefab = null;

    enemyList: Record<string, Node> = {};

    updateEnemiesInfo(enemies: Record<string, Vec3>) {
        let newEnemyList = enemies;

        for (const [id, node] of Object.entries(this.enemyList)) {
            if (Object.keys(enemies).includes(id)) {
                node.setPosition(enemies[id]);
                delete newEnemyList[id];
            }
            else {
                node.destroy();
                delete this.enemyList[id];
            }
        }

        for (const [id, pos] of Object.entries(newEnemyList)) {
            this.enemyList[id] = instantiate(this.enemyPrefab);
            this.enemyList[id].parent = this.gameField;
            this.enemyList[id].setPosition(pos);
        }
        
    }

    update(deltaTime: number) {
        
    }
}


