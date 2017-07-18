using UnityEngine;
using System.Collections;

public class Manager : MonoBehaviour
{
	public GameObject titlePrefab;
	public GameObject playerPrefab;
	public GameObject emitterPrefab;
	GameObject title, emitter, player;

	public bool isPlaying {
		get {
			return title == null;
		}
	}

	void Start ()
	{
		title = (GameObject)Instantiate (titlePrefab, Vector3.zero, Quaternion.identity);
	}

	public void GameStart ()
	{
		Destroy (title);
		emitter = (GameObject)Instantiate (emitterPrefab);
		player = (GameObject)Instantiate (playerPrefab);
	}

	public void GameOver ()
	{
		title = (GameObject)Instantiate (titlePrefab, Vector3.zero, Quaternion.identity);
		Destroy (player);
		Destroy (emitter);
	}
}