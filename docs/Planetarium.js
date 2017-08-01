var cvs = document.getElementById('canvas');
var ctx = cvs.getContext('2d');

var glow = 0;

/**
 * RGB配列 を HSV配列 へ変換します
 *
 * @param   {Number}  r         red値   ※ 0～255 の数値
 * @param   {Number}  g         green値 ※ 0～255 の数値
 * @param   {Number}  b         blue値  ※ 0～255 の数値
 * @param   {Boolean} coneModel 円錐モデルにするか
 * @return  {Object}  {h, s, v} ※ h は 0～360の数値、s/v は 0～255 の数値
 */
function RGBtoHSV (r, g, b, coneModel) {
  var h, // 0..360
      s, v, // 0..255
      max = Math.max(Math.max(r, g), b),
      min = Math.min(Math.min(r, g), b);

  // hue の計算
  if (max == min) {
    h = 0; // 本来は定義されないが、仮に0を代入
  } else if (max == r) {
    h = 60 * (g - b) / (max - min) + 0;
  } else if (max == g) {
    h = (60 * (b - r) / (max - min)) + 120;
  } else {
    h = (60 * (r - g) / (max - min)) + 240;
  }

  while (h < 0) {
    h += 360;
  }

  // saturation の計算
  if (coneModel) {
    // 円錐モデルの場合
    s = max - min;
  } else {
    s = (max == 0)
      ? 0 // 本来は定義されないが、仮に0を代入
      : (max - min) / max * 255;
  }

  // value の計算
  v = max;

  return {'h': h, 's': s, 'v': v};
}

/**
 * HSV配列 を RGB配列 へ変換します
 *
 * @param   {Number}  h         hue値        ※ 0～360の数値
 * @param   {Number}  s         saturation値 ※ 0～255 の数値
 * @param   {Number}  v         value値      ※ 0～255 の数値
 * @return  {Object}  {r, g, b} ※ r/g/b は 0～255 の数値
 */
function HSVtoRGB (h, s, v) {
  var r, g, b; // 0..255

  while (h < 0) {
    h += 360;
  }

  h = h % 360;

  // 特別な場合 saturation = 0
  if (s == 0) {
    // → RGB は V に等しい
    v = Math.round(v);
    return {'r': v, 'g': v, 'b': v};
  }

  s = s / 255;

  var i = Math.floor(h / 60) % 6,
      f = (h / 60) - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s)

  switch (i) {
    case 0 :
      r = v;  g = t;  b = p;  break;
    case 1 :
      r = q;  g = v;  b = p;  break;
    case 2 :
      r = p;  g = v;  b = t;  break;
    case 3 :
      r = p;  g = q;  b = v;  break;
    case 4 :
      r = t;  g = p;  b = v;  break;
    case 5 :
      r = v;  g = p;  b = q;  break;
  }

  return {'r': Math.round(r), 'g': Math.round(g), 'b': Math.round(b)};
}

function morph(f,t,d)
{ return f+(t-f)/d; }

function glowArc( x, y, r, red, green, blue, alpha )
{
  var prvCO = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  var grad = ctx.createRadialGradient( x, y, r, x, y, 3*r );
  grad.addColorStop( 0.0, "rgba("+red.toString()+","+green.toString()+","+blue.toString()+","+alpha.toString()+")" );
  grad.addColorStop( 1.0, "rgba(0,0,0,0)" );

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc( x, y, r*3, 0, 2*Math.PI, false );
  ctx.fill();
  ctx.globalCompositeOperation = prvCO;
}

var vmagMin = Number.POSITIVE_INFINITY, vmagMax = Number.NEGATIVE_INFINITY;
for( var st of stars )
{
  vmagMin = Math.min( vmagMin, st.vmag );
  vmagMax = Math.max( vmagMax, st.vmag );
}

var consS = new Set(), consC = {};

for( var cs of cons )
{
  if( consC[cs.name] == undefined )
    consC[cs.name] = new Set();

  consC[cs.name].add( cs.num1 );
  consC[cs.name].add( cs.num2 );
  consS.add( cs.num1 );
  consS.add( cs.num2 );
}

console.log(vmagMin);

var q = Quaternion.defQ, toQ = Quaternion.defQ;
var Rad = Math.PI/180;
var scale = 320, toS = 320;
var consEm = false, starNameF = false, consNameF = 1;

document.onkeydown = event => {
  var keyEvent = event || window.event;

  switch( keyEvent.keyCode )
  {
    case 37: // Left
      toQ = Quaternion.qMul( Quaternion.rotXQ(15*Rad), toQ );
      break;
    case 38: // Up
      toQ = Quaternion.qMul( Quaternion.rotYQ(-15*Rad), toQ );
      break;
    case 39: // Right
      toQ = Quaternion.qMul( Quaternion.rotXQ(-15*Rad), toQ );
      break;
    case 40: // Down
      toQ = Quaternion.qMul( Quaternion.rotYQ(15*Rad), toQ );
      break;
    case 90: // Z
      toS = 700;
      break;
  }
}

document.onkeyup = event => {
  var keyEvent = event || window.event;

  switch( keyEvent.keyCode )
  {
    case 90: // Z
      toS = 320;
      break;
    case 65: // A
      consEm ^= true;
      break;
    case 88: // X
      starNameF ^= true;
      break;
    case 67: // C
      ++consNameF;

      if( consNameF > 2 )
        consNameF = 0;

      break;
  }
}

function render()
{
  var w = cvs.width, h = cvs.height;

  ctx.fillStyle = "rgb(40,40,40)";
  ctx.fillRect( 0, 0, w, h );

  q = Quaternion.qSlerp( q, toQ, 0.1 );
  scale = morph( scale, toS, 10 );

  var starCrds = {};

  for( var st of stars )
  {
    var theta = Math.PI/2-st.decl, phi = st.ra;
    var xyz = [Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)];
    xyz = Quaternion.applyQ( xyz, q );

    var xy = persp( xyz, 0, 0, -5, 0, 0, 5, 0, 1, 0 );
  
    //console.log(xy);

    starCrds[st.num] = { x: w/2+scale*xy[0], y: h/2+scale*xy[1], xyz: [].concat(xyz) };
  }

  for( var name of stNameE )
  {
    var v = starCrds[name.num];

    if( v != undefined && v.xyz[2] > 0 && starNameF )
    {
      ctx.font = "normal 1px 'Yu Gothic'";
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillText( name.name, v.x, v.y );
    }
  }

  var used = {};

  for( var cs of cons )
  {
    var u = starCrds[cs.num1], v = starCrds[cs.num2];

    if( u != undefined && v != undefined && u.xyz[2] > 0 && v.xyz[2] > 0 )
    {
      ctx.beginPath();
      ctx.strokeStyle = "rgb(255,255,255)";
      ctx.lineWidth = 1;
      ctx.moveTo( u.x, u.y );
      ctx.lineTo( v.x, v.y );
      ctx.stroke();

      if( !used[cs.name] && consNameF != 0 )
      {
        var cx = 0, cy = 0;
        for( var cI of consC[cs.name].values() ) if( starCrds[cI] != undefined )
        {
          cx += starCrds[cI].x/consC[cs.name].size;
          cy += starCrds[cI].y/consC[cs.name].size;
        }
        ctx.font = "normal 10px 'Yu Gothic'";
        ctx.fillStyle = "rgb(255,255,255)";
        var cN = consName[consNameS.indexOf(cs.name)];
        ctx.fillText( consNameF==1?cN.jpName:cN.engName, cx, cy );
        used[cs.name] = true;
      }
    }
  }

  for( var st of stars )
  {
    var v = starCrds[st.num];

    if( v.xyz[2] > 0 )
      glowArc( v.x, v.y, 3, Math.min(255, Math.floor(st.r)), Math.min(255, Math.floor(st.g)), Math.min(255, Math.floor(st.b)), consEm?consS.has(st.num)?1.0:0.1:3**(-(st.vmag-vmagMin)/5)/*(st.vmag-vmagMin)/(vmagMax-vmagMin)*/ );
  }

  ctx.font = "normal 40px 'Yu Gothic'";
  ctx.fillStyle = "rgb(255,255,255)";  
  var iY = 60;    
  ctx.fillText( "consEm: "+(consEm?"true":"false")+" (A Key)", 20, iY ); iY += 50;
  ctx.fillText( "starNameF: "+(starNameF?"true":"false")+" (X Key)", 20, iY ); iY += 50;
  ctx.fillText( "consNameF: "+(consNameF==0?"false":consNameF==1?"JP":"ENG")+" (C Key)", 20, iY ); iY += 50;
  ctx.fillText( "Magnify (Z Key)", 20, iY );
   
}

setInterval( render, 1000/60 );