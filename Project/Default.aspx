<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WordRaces.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>WordRaces.com</title>
    <asp:Literal ID="CssLink" runat="server"></asp:Literal>
    <asp:Literal ID="JsLink" runat="server"></asp:Literal>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <script type="text/javascript">
        var _PlayerGuid = "<%=_PlayerGuid%>";
    </script>
</head>
<body onload="body_onload();">
    <form id="form1" runat="server" onsubmit="return false;">
        <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePageMethods="true"></asp:ScriptManager>

        <div id="TopDiv">

            <div class="MainTitleBar">
                <div id="MainTitle">WordRaces.com</div>
            </div>

            <div id="NewPlayerDiv">
                <p id="MonikerLabel">Choose a User Name</p>
                <input type="text" id="Moniker" maxlength="20" placeholder="20 chars maximum" /><br />
                <button id="MonikerButton" class="Control" type="button" onclick="AddPlayer();">Submit</button>
                <button id="WatchVideoButton" class="Control" type="button" onclick="WatchVideo();">Watch Video</button>
            </div>

            <div class="ControlsContainer">

                <div id="ControlPanelOne" class="ControlPanel" style="display:none;">
                    <div id="ThisPlayersButtons" class="ButtonRow1">
                        <button id="StartButton" type="button" class="Control" onclick="startGame();">Next Game</button>
                    </div>
                    <div id="LeaderBoardButtons" class="ButtonRow2"></div>
                </div>

                <div id="ControlPanelTwo" class="ControlPanel" style="display:none;">

                    <div class="ButtonRow1">
                        <button id="SwapButton" type="button" class="Control" onclick="swap();">Swap</button>
                        <button id="VerifyButton" type="button" class="Control" onclick="verify();">Test</button>
                    </div>
                    <div id="TopLettersSpan" class="ButtonRow2"></div>

                </div>

            </div>

        </div>

        <div id="BotDiv">
            <div id="MainGrid">
            </div>
        </div>
    </form>

    <div id="Blocker2" class="Blocker">
        <table>
            <tr>
                <td>Spelling:</td>
                <td id="SpellingValue">Y</td>
            </tr>
            <tr>
                <td>Layout:</td>
                <td id="LayoutValue">Y</td>
            </tr>
            <tr>
                <td>Complete:</td>
                <td id="CompleteValue">Y</td>
            </tr>
            <tr>
                <td colspan="2" class="ButtonColumn">
                    <button id="VerifyCompleteButton" type="button" class="BlockerButton" onclick="verify_complete();">OK</button>
                </td>
            </tr>
        </table>
    </div>

    <div id="Blocker" class="Blocker">
        &nbsp;
    </div>

</body>
</html>
