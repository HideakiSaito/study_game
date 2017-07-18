using UnityEngine;

public class PlayerBullet : MonoBehaviour
{
	public int speed = 5;
	
	void Start ()
	{
		rigidbody2D.velocity = Vector2.up.normalized * speed;
	}
}