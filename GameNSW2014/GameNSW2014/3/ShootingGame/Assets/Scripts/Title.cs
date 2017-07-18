using UnityEngine;
using System.Collections;
using System;

public class Title : MonoBehaviour
{
	Manager manager;

	void Start ()
	{
		manager = FindObjectOfType<Manager> ();
	}

	void Update ()
	{
		if (Input.GetKeyDown (KeyCode.X)) {
			manager.GameStart ();
		}
	}
}