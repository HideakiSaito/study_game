using UnityEngine;
using System.Collections;

public class DestroyArea : MonoBehaviour
{
	void OnTriggerEnter2D (Collider2D c)
	{
		Destroy (c.gameObject);
	}
}
