using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Player : MonoBehaviour
{
    public Queue<Player> aimList;
    public string id;
    public string playerName;
    public System.DateTime drawTime;
    public Network network;
    public Dust dust;
    public bool draw = false;
    Animator anim;

    //Temporary
    public Player()
    {

    }
    void Start()
    {
        anim = GetComponent<Animator>();
    }

    private void Update()
    {
		if (draw && (Input.anyKeyDown || (System.DateTime.Now - drawTime).TotalMilliseconds > 2000f))
		        Fire();
    }

    private void Fire()
    {
        network.OnFire(this);
        draw = false;
        anim.SetTrigger("fire");
    }
    public void GetShot(GameObject shooter)
    {
        anim.SetTrigger("shot");

    }
    public void ResetValues()
    {
        draw = false;
        anim.SetTrigger("reset");
        dust.resetPosition();
    }

    public void SetName(string value)
    {
        GetComponentInChildren<Text>().text = value;
        playerName = value;
    }

    public string ToJSON()
    {
        return string.Format(@"{{""id"":""{0}""}}", id);
    }
}