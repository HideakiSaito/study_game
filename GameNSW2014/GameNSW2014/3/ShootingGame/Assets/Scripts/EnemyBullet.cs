using UnityEngine;

public class EnemyBullet : MonoBehaviour
{
	public int speed = 5;
	
	public void Shot (Vector2 direction)
	{
		// 弾に速度（速さと方向）を与えて動かす
		rigidbody2D.velocity = direction.normalized * speed;
	}
}