using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;

public class Network : MonoBehaviour
{
    static SocketIOComponent socket;
    public GameObject playerPrefab;
    public GameObject localPlayer;
    public Dust dust;
	public Canvas canvas;
	Dictionary<string, GameObject> players;
    DateTime DrawTime;
    // Start is called before the first frame update
    void Start()
    {
		Screen.SetResolution(1024, 768, false);

        socket = GetComponent<SocketIOComponent>();
        socket.On("connect", OnConnect);
        socket.On("nameSelf", OnNameSelf);
        socket.On("spawn", OnSpawn);
        socket.On("draw", OnDraw);
        socket.On("shot", OnShot);
        socket.On("win", OnWin);
        socket.On("died", OnDead);
		socket.On("displayHighScores", OnHighScores);
        socket.On("debug", OnDebug);
        socket.On("requestSpawn", OnRequestSpawn);
        socket.On("findWinner", OnFindWinner);
        players = new Dictionary<string, GameObject>();
    }


    #region OnSocket Functions

    void OnConnect(SocketIOEvent e)
    {
        Debug.Log("OnConnect" + e.data);
    }

    void OnFindWinner(SocketIOEvent e)
    {
        Player local = localPlayer.GetComponent<Player>();
        //Debug.Log(e.data["id"].ToString() + " : " + local.id);
        if(e.data["id"].ToString().Trim('"') == local.id)
        {
            JSONObject data = new JSONObject();
            data.AddField("id", local.id);
            data.AddField("playerName", local.playerName);
            data.AddField("shotTime", e.data["shotTime"]);
            socket.Emit("winner", data);
        }        
    }

    void OnRequestSpawn(SocketIOEvent e)
    {
        JSONObject data = new JSONObject();
        data.AddField("id", localPlayer.GetComponent<Player>().id);
        data.AddField("playerName", localPlayer.GetComponent<Player>().playerName);
        socket.Emit("spawnExisting", data);
    }

    void OnNameSelf(SocketIOEvent e)
    {
        localPlayer.GetComponent<Player>().id = e.data["id"].ToString().Trim('"');
    }

    void OnSpawn(SocketIOEvent e)
    {
        players.Add(e.data["id"].ToString().Trim('"'), GameObject.Instantiate(playerPrefab));
        players[e.data["id"].ToString().Trim('"')].GetComponent<Player>().id = e.data["id"].ToString().Trim('"');
        players[e.data["id"].ToString().Trim('"')].GetComponent<Player>().SetName(e.data["playerName"].ToString().Trim('"'));

    }

    void OnDraw(SocketIOEvent e)
    {
        Debug.Log("Draw!");
        DrawTime = System.DateTime.Now;
        //  Tell player to fire
        GetComponent<SpriteRenderer>().enabled = true;
        dust.Go();
        localPlayer.GetComponent<Player>().draw = true;
        localPlayer.GetComponent<Player>().drawTime = DrawTime;
    }

    void OnShot(SocketIOEvent e)
    {
        Debug.Log("A hit on: " + e.data["id"].ToString().Trim('"'));
        Debug.Log("Local player: " + localPlayer.GetComponent<Player>().id);
        Debug.Log("Other Player: " + players[e.data["id"].ToString().Trim('"')].GetComponent<Player>().id);
        if (e.data["id"].ToString().Trim('"') == localPlayer.GetComponent<Player>().id)
            localPlayer.GetComponent<Player>().GetShot();
        else
            players[e.data["id"].ToString().Trim('"')].GetComponent<Player>().GetShot();
    }

    void OnWin(SocketIOEvent e)
    {
        
    }
    void OnDead(SocketIOEvent e)
    {
        string timer = e.data["timer"].ToString();
    }

	void OnHighScores(SocketIOEvent e)
	{
        Debug.Log("Displaying the highscores.");
		
		canvas.GetComponent<CanvasScript>().DisplayLeaderBoard(e);
	}

    void OnDebug(SocketIOEvent e)
    {
        Debug.Log(e.data);
    }

	#endregion

	public void OnFire(Player player)
    {
        Debug.Log("BANG");
        JSONObject data = new JSONObject();
        TimeSpan reaction = System.DateTime.Now - DrawTime;
        data.AddField("id", player.id);
		data.AddField("playerName", player.playerName);
        data.AddField("shotTime", (float)reaction.TotalMilliseconds);
        Debug.Log(data["id"] + " : " + data["playerName"] + " : " + data["shotTime"]);
        socket.Emit("shotTime", data);
    }

    public void EnterName(string playerName)
    {
        Debug.Log("Hey look, it's " + playerName);
        localPlayer.GetComponent<Player>().SetName(playerName);
        JSONObject data = new JSONObject();
        data.AddField("id", localPlayer.GetComponent<Player>().id);
        data.AddField("playerName", playerName);
        socket.Emit("ready", data);

        //data.AddField("shotTime", 375.14456f);
        //socket.Emit("winner", data);
    }
}
