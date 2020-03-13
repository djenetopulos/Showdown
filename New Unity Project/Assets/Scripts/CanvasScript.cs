using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using SocketIO;

public class CanvasScript : MonoBehaviour
{
	public List<Text> HighScores = new List<Text>();
	public GameObject panel;

	public void DisplayLeaderBoard(SocketIOEvent e)
	{
        panel.SetActive(true);

        Debug.Log(e);
        List<JSONObject> records = e.data["AllRecords"].list;
        int i = 0;

        foreach (Text score in HighScores)
		{
            string a = records[i]["user"].ToString().Trim('"');
            string b = "";
            string c = records[i]["time"].ToString().Trim('"');

            while(a.Length <= 10)
            {
                a = a + ".";
            }
            while(c.Length <= 9)
            {
                c = c + " ";
            }
            while((a.Length + b.Length + c.Length) <= 41)
            {
                b = b + ".";
            }

            score.text = a + b + c;           

            //score.text = records[i]["user"].ToString().Trim('"') + "\t\t\t..........\t\t" + records[i]["time"]; 
            i++;
        }
	}
}
