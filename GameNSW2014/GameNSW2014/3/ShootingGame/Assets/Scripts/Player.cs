using UnityEngine;
using System.Collections;

public class Player : MonoBehaviour
{
	public float speed = 5;
	public GameObject playerBullet;
	public GameObject explosion;
	float shotDelay = 0.1f;

	Manager manager;

	Vector2 direction {
		get {
			float x = Input.GetAxisRaw ("Horizontal");
			float y = Input.GetAxisRaw ("Vertical");
			return new Vector2 (x, y);
		}
	}

	IEnumerator Start ()
	{
		manager = FindObjectOfType<Manager> ();

		while (true) {
			Instantiate (playerBullet, transform.position, transform.rotation);
			yield return new WaitForSeconds (shotDelay);
		}
	}

	void Update ()
	{
		rigidbody2D.velocity = direction.normalized * speed;

		Vector3 pos = transform.position;
		pos.x = Mathf.Clamp (pos.x, -4, 4);
		pos.y = Mathf.Clamp (pos.y, -3, 3);
		transform.position = pos;
	}

	void OnTriggerStay2D (Collider2D c)
	{
		Instantiate (explosion, transform.position, transform.rotation);

		manager.GameOver ();
	}
}