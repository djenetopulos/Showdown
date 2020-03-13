using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Dust : MonoBehaviour
{
    public float speed = 5f;
    public bool go = false;
    public bool passed = false;
    Vector3 startPosition;
    private void Start()
    {
        startPosition = transform.position;
    }

    void Update()
    {
        if(go)
            transform.Translate(speed, 0, 0);
        if(transform.position.x >= -2f)
        {
            passed = true;
        }
    }

    public void Go()
    {
        go = true;
    }

    public void resetPosition()
    {
        go = false;
        transform.position = new Vector3(-20, 0, 0);
    }
}