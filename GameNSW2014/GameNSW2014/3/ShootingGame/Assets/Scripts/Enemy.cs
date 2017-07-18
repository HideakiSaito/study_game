using UnityEngine;
using System.Collections;

public class Enemy : MonoBehaviour
{
	public GameObject enemyBullet;
	public float shotDelay = 3f;
	public int hp = 2;
	public float speed = 0.5f;
	public GameObject explosion;

	Transform[] shotPositions;

	IEnumerator Start ()
	{
		shotPositions = transform.GetComponentsInChildren<Transform> ();

		while (true) {

			foreach (var shotPosition in shotPositions) {

				if (transform == shotPosition)
					continue;

				GameObject g = (GameObject)Instantiate (enemyBullet, shotPosition.position, shotPosition.rotation);
				EnemyBullet bullet = g.GetComponent<EnemyBullet> ();
				bullet.Shot (shotPosition.up * -1);
			}


			yield return new WaitForSeconds (shotDelay);
		}
	}

	void OnTriggerEnter2D (Collider2D c)
	{
		int layer = LayerMask.NameToLayer ("PlayerBullet");
		if (c.gameObject.layer == layer) {
			Destroy (c.gameObject);
			OnDamage ();
		}
	}

	void OnDamage ()
	{
		if (--hp <= 0) {
			Destroy (gameObject);
			Instantiate (explosion, transform.position, transform.rotation);
		}
	}

	void FixedUpdate ()
	{
		rigidbody2D.velocity = transform.up * -1 * speed;
	}
}
