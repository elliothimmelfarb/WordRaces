//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WordRaces
{
    using System;
    
    public partial class GetGameInfo_Result
    {
        public int GameID { get; set; }
        public System.Guid GameGuid { get; set; }
        public bool IsStarted { get; set; }
        public int PlayerCount { get; set; }
        public System.DateTime CreateTime { get; set; }
        public Nullable<int> Winner { get; set; }
        public Nullable<int> PlayerNum { get; set; }
    }
}