using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Services;
using System.Threading;
using System.Net;
using System.IO;

namespace WordRaces
{
    public partial class Default : System.Web.UI.Page
    {
        public string _PlayerGuid;
        protected void Page_Load(object sender, EventArgs e)
        {

            // Import CSS & JS
            CssLink.Text = string.Format("<link href='/default.css?{0}' rel='stylesheet' type='text/css' />", DateTime.Now.Ticks);
            JsLink.Text = string.Format("<script src = '/default.js?{0}'></script>", DateTime.Now.Ticks);

            string id = Request.QueryString["id"];

            _PlayerGuid = string.IsNullOrWhiteSpace(id) ? "*NEW" : id;

        }

        [WebMethod]
        public static string AddPlayer(string moniker)
        {
            using (DWKDBEntities wrd = new DWKDBEntities())
            {
                var result = wrd.AddPlayer(moniker).SingleOrDefault();
                return result.PlayerGuid.Trim();
            }
        }

        [WebMethod]
        public static List<GetBoard_Result> GetBoard(int gamePlayerID)
        {
            using (DWKDBEntities wrd = new DWKDBEntities())
            {
                var result = wrd.GetBoard(gamePlayerID).ToList();
                return result;
            }
        }

        [WebMethod]
        public static List<string> Verify(string board)
        {

            string urlbase = "http://www.wordgamedictionary.com/api/v1/references/scrabble/{0}?key=9.521783219858186e29";


            WebRequest reqst = null;
            WebResponse resp = null;
            Stream stream = null;
            StreamReader reader = null;
            string xml = "";

            List<string> result = new List<string>();

            using (DWKDBEntities wrd = new DWKDBEntities())
            {
                var words = wrd.FindWords(board).ToList();

                if (words.Count() == 0)
                {
                    result.Add("*VERIFIED");
                    return result;
                }

                foreach (var word in words)
                {
                    string url = String.Format(urlbase, word.Word);
                    reqst = WebRequest.Create(url);
                    resp = reqst.GetResponse();
                    stream = resp.GetResponseStream();
                    reader = new StreamReader(stream);
                    xml += reader.ReadToEnd();

                    int scrabblePos = xml.LastIndexOf("<scrabble>");
                    bool isLegalWord = xml.Substring(scrabblePos + 10, 1) == "1" ? true : false;

                    if (isLegalWord)
                    {
                        WorderBee wb = new WorderBee(word.Word);
                        var thread = new Thread(() => wb.AddLegalWord());
                        thread.Start();
                    }
                    else
                    {
                        result.Add(word.Word);
                    }

                }

                reader.Close();
                stream.Close();
                resp.Close();

                if (result.Count == 0)
                {
                    result.Add("*VERIFIED");
                    return result;
                }

                return result;

            }

        }

        [WebMethod]
        public static List<GameOver_Result> GameOver(int gameID, int playerID, Int64 gameTimeMilli, string completedBoard)
        {

            using (DWKDBEntities wrd = new DWKDBEntities())
            {
                var result = wrd.GameOver(gameID, playerID, gameTimeMilli, completedBoard).ToList();

                return result;

            }

        }

        private class WorderBee
        {
            string _MultipurposeString = "";
            string _gameGuid = "";
            int _playerNum = 0;
            public WorderBee(string legalWord)
            {
                _MultipurposeString = legalWord;
            }

            public void AddLegalWord()
            {

                using (DWKDBEntities wrd = new DWKDBEntities())
                {
                    wrd.AddLegalWord(_MultipurposeString);
                }

            }
        }


        [WebMethod]
        public static PlayerAndGames GetPlayerAndGames(string playerGuid)
        {
            PlayerAndGames pag = new PlayerAndGames();
            pag.RecentGames = new List<GamePlusLeaderBoard>();

            using (DWKDBEntities wrd = new DWKDBEntities())
            {
                var player = wrd.GetPlayer(playerGuid).SingleOrDefault();
                var games = wrd.GetGamesByPlayerID(player.PlayerID).ToList();

                pag.Player = player;

                var recentGames = games.Where(g => g.RecordType == "Player").ToList();

                foreach(var personalGame in recentGames)
                {
                    var recentGame = new GamePlusLeaderBoard();
                        recentGame.PersonalGame = personalGame;
                        recentGame.LeaderBoard =  games.Where(g => 
                        g.RecordType == "LeaderBoard" && 
                        g.GameID == personalGame.GameID
                        ).ToList();
                    pag.RecentGames.Add(recentGame);
                }
                

                return pag;
            }
        }

        public class PlayerAndGames
        {
            public GetPlayer_Result Player { get; set; }
            public List<GamePlusLeaderBoard> RecentGames { get; set; }
        }
        public class GamePlusLeaderBoard
        {
            public GetGamesByPlayerID_Result PersonalGame { get; set; }
            public List<GetGamesByPlayerID_Result> LeaderBoard { get; set; }
        }
    }

}
