
function makeMove(move){
  if(!canPlay())return;

  const uci=move.from+move.to+(move.promotion||"");

  const result=game.move({
    from:move.from,
    to:move.to,
    promotion:move.promotion||"q"
  });

  if(!result)return;

  lastMoveId++;
  selected=null;
  legalTargets=[];

  drawBoard();

  // Send the final move before checking for checkmate.
  if(role!=="local"&&connection&&connection.open){
    send({
      type:"move",
      uci,
      id:lastMoveId
    });
  }

  checkEnd();

  if(running){
    status(colorName(game.turn())+
      (game.in_check()?" · Check!":"")+" to move");
  }
}

