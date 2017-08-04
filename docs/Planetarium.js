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
var starsfN = {};
var maxRGB = 0;
for( var st of stars )
{
  vmagMin = Math.min( vmagMin, st.vmag );
  vmagMax = Math.max( vmagMax, st.vmag );
  starsfN[st.num] = st;

  if( st.r >= 0 && st.g >= 0 && st.b >= 0 )
  {
    maxRGB = Math.max( maxRGB, st.r );
    maxRGB = Math.max( maxRGB, st.g );
    maxRGB = Math.max( maxRGB, st.b );
  }
}

maxRGB = 300;

var consS = new Set(), consC = {}, consLLC = {}, star2Cons = {};

for( var cs of cons )
{
  if( consC[cs.name] == undefined )
    consC[cs.name] = new Set();

  consC[cs.name].add( cs.num1 );
  consC[cs.name].add( cs.num2 );
  consS.add( cs.num1 );
  consS.add( cs.num2 );
  star2Cons[cs.num1] = consNameS.indexOf(cs.name);
  star2Cons[cs.num2] = consNameS.indexOf(cs.name);
}

for( var consCI in consC )
{
  consLLC[consCI] = { ra: 0, decl: 0 };
 
  var head = consC[consCI].values().next().value;
  consLLC[consCI].ra = starsfN[head].ra;
  consLLC[consCI].decl = starsfN[head].decl;    

  /*for( var csI of consC[consCI] )
  {
    if( starsfN[csI] != undefined )
      consLLC[consCI].ra += starsfN[csI].ra / consC[consCI].size;
    if( starsfN[csI] != undefined )
      consLLC[consCI].decl += starsfN[csI].decl / consC[consCI].size;
  }*/
}

var stNameEfN = {};
for( var sne of stNameE )
  stNameEfN[sne.num] = sne.name;

console.log(consLLC);

console.log(vmagMin);

var starCrds = {};
var focusSt = -1, focusCons = -1;

var q = Quaternion.defQ, toQ = Quaternion.defQ;
var Rad = Math.PI/180;
var scale = 320, toS = 320, srat = 0, tosrat = 0;
var consEm = true, consF = true, starNameF = false, consNameF = 1, isMag = false;
var mode = 0;
var mX, mY;

document.onmousemove = event => {
  mX = event.clientX;
  mY = event.clientY;
};

document.onmousedown = event => {
  clicked = true;
};

document.onmouseup = event => {
  focusSt = -1;
  
  var fl = false;

  for( var sc in starCrds )
  {
    if( starCrds[sc].xyz[2] > 0 && (mX-starCrds[sc].x)**2+(mY-starCrds[sc].y)**2 <= 3**2 )
      focusSt = sc, focusCons = star2Cons[focusSt]==undefined?-1:star2Cons[focusSt], fl = true;
  }

  if( !fl )
    focusCons = -1;

  clicked = false;
};

var isShift = false;

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
      break;
    case 16: // Shift
      isShift = true;
      break;
  }
};

document.onkeyup = event => {
  var keyEvent = event || window.event;

  switch( keyEvent.keyCode )
  {
    case 90: // Z
      isMag ^= true;
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
    case 81: // Q
      ++mode;

      if( mode > 2 )
        mode = 0;
      break;
    case 16:
      isShift = false;
      break;
    case 32: // Space
      focusSt = -1;

      if( isShift )
        --focusCons;
      else
        ++focusCons;

      if( focusCons >= consNameS.length )
        focusCons = 0;
      if( focusCons < 0 )
        focusCons = consNameS.length-1;

      var theta = Math.PI/2-consLLC[consNameS[focusCons]].decl, phi = consLLC[consNameS[focusCons]].ra;
      //toQ = Quaternion.rotYQ( -phi-Math.PI/2 );
      toQ = Quaternion.qMul( Quaternion.rotXQ( -theta ), Quaternion.rotZQ( -phi-Math.PI/2 ) );

      break;
    case 83: // S
      consF ^= true;
      break;
  }
};

function render()
{
  var w = cvs.width, h = cvs.height;

  ctx.fillStyle = "rgb(40,40,40)";
  ctx.fillRect( 0, 0, w, h );

  q = Quaternion.qSlerp( q, toQ, 0.1 );
  scale = morph( scale, toS, 10 );

  toS = isMag ? 700 : 320;

  tosrat = mode==0?0:mode==1?1:1000;

  srat = morph( srat, tosrat, 4 );

  starCrds = {};
  var maxR = 0;

  for( var st of stars )
    maxR = Math.max( maxR, 1/st.par );

  for( var st of stars )
  {
    var theta = Math.PI/2-st.decl, phi = st.ra;
    var xyz = [Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)];
    xyz = Quaternion.applyQ( xyz, q );

    var xy = persp( xyz, 0, 0, -5, 0, 0, 5, 0, 1, 0 );
  
    //console.log(xy);

    starCrds[st.num] = { x: w/2+(scale+srat*Math.min(100,1/st.par)*300)*xy[0], y: h/2+(scale+srat*Math.min(100,1/st.par)*300)*xy[1], xyz: [].concat(xyz) };
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

  if( consF ) for( var cs of cons )
  {
    var u = starCrds[cs.num1], v = starCrds[cs.num2];

    if( u == undefined )
      console.log(cs.num1, cs.name);
    if( v == undefined )
      console.log(cs.num1, cs.name);    

    if( u != undefined && v != undefined && u.xyz[2] > 0 && v.xyz[2] > 0 && mode <= 1 )
    {
      ctx.beginPath();

      var alpha;

      if( focusSt != -1 )
        alpha = consC[cs.name].has(parseFloat(focusSt)) ? 1.0 : 0.1;
      else if( focusCons != -1 )
        alpha = cs.name == consNameS[focusCons] ? 1.0 : 0.1;
      else
        alpha = 1.0;

      ctx.strokeStyle = "rgba(255,255,255,"+alpha.toString()+")";
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
    {
      var alpha;
      // focusSt!=-1?st.num==focusSt?1.0:0.1:consEm?consS.has(st.num)?1.0:0.1:3**(-(st.vmag-vmagMin)/(mode<=1?8:20))
      if( focusSt != -1 )
      {
        if( st.num == focusSt )
          alpha = 1.0;
        else
          alpha = 0.1;
      }
      else if( focusCons != -1 )
      {
        if( consC[consNameS[focusCons]].has(st.num) )
          alpha = 1.0;
        else
          alpha = 0.1;
      }
      else
      {
        if( consEm )
        {
          if( consS.has(st.num) )
            alpha = 1.0;
          else
            alpha = 0.1;
        }
        else
          alpha = 3**(-(st.vmag-vmagMin)/(mode<=1?8:20));
      }

      //console.log(Math.floor(st.r*255/maxRGB), Math.floor(st.g*255/maxRGB), Math.floor(st.b*255/maxRGB));
      var hsv = RGBtoHSV(Math.floor(st.r),Math.floor(st.g),Math.floor(st.b));
      var rgb = HSVtoRGB(hsv.h,hsv.s,255);
      glowArc( v.x, v.y, 3, rgb.r, rgb.g, rgb.b, alpha/*(st.vmag-vmagMin)/(vmagMax-vmagMin)*/ );
    }
  }

  ctx.font = "normal 30px 'Yu Gothic'";
  ctx.fillStyle = "rgb(255,255,255)";  
  var iY = 60;    
  ctx.fillText( "consEm: "+(consEm?"true":"false")+" (A Key)", 20, iY ); iY += 40;
  ctx.fillText( "consF: "+(consF?"true":"false")+" (S Key)", 20, iY ); iY += 40;
  ctx.fillText( "starNameF: "+(starNameF?"true":"false")+" (X Key)", 20, iY ); iY += 40;
  ctx.fillText( "consNameF: "+(consNameF==0?"false":consNameF==1?"JP":"ENG")+" (C Key)", 20, iY ); iY += 40;
  ctx.fillText( "mode: "+(mode==0?"Sphere":mode==1?"SphereDist":"Space")+" (Q Key)", 20, iY ); iY += 40;
  ctx.fillText( "Magnify (Z Key)", 20, iY ); iY += 40; 
  ctx.fillText( "Star Info (Click)", 20, iY ); iY += 40; 
  ctx.fillText( "Cons Tour (Space)", 20, iY ); iY += 40; 
  ctx.fillText( "Rotate (←↑↓→ Key)", 20, iY ); iY += 40;

  if( focusSt != -1 )
  {
    ctx.font = "normal 15px 'Ricty Diminished'";  
    ctx.fillText( "[Star Info]", 20, iY ); iY += 20;
    ctx.fillText( "HIP Number: "+starsfN[focusSt].num, 20, iY ); iY += 20;
    if( stNameEfN[focusSt] != undefined )
      ctx.fillText( "Name: "+stNameEfN[focusSt], 20, iY ), iY += 20;  
    ctx.fillText( "Right ascension: "+starsfN[focusSt].ra, 20, iY ); iY += 20;
    ctx.fillText( "Declination: "+starsfN[focusSt].decl, 20, iY ); iY += 20;
    ctx.fillText( "Parallax: "+starsfN[focusSt].par, 20, iY ); iY += 20;
    ctx.fillText( "Light year: "+3.261563777*1000/starsfN[focusSt].par, 20, iY ); iY += 20;
    ctx.fillText( "Magnitude: "+starsfN[focusSt].vmag, 20, iY ); iY += 20;
    ctx.fillText( "bv Color: "+starsfN[focusSt].bv, 20, iY ); iY += 20;
    ctx.fillText( "Temperature: "+starsfN[focusSt].temp, 20, iY ); iY += 20;
    ctx.fillText( "RGB: ("+starsfN[focusSt].r.toFixed(0)+","+starsfN[focusSt].g.toFixed(0)+","+starsfN[focusSt].b.toFixed(0)+")", 20, iY ); iY += 20;
  }

  if( focusCons != -1 )
  {
    ctx.font = "normal 15px 'Ricty Diminished'";  
    ctx.fillText( "[Cons Tour]", 20, iY ); iY += 20;
    ctx.fillText( "Cons: "+consNameS[focusCons], 20, iY ); iY += 20;
    ctx.fillText( "jpName: "+consName[focusCons].jpName, 20, iY ); iY += 20;
    ctx.fillText( "engName: "+consName[focusCons].engName, 20, iY ); iY += 20; 
    ctx.fillText( "Right ascension: "+consLLC[consNameS[focusCons]].ra, 20, iY ); iY += 20; 
    ctx.fillText( "Declination: "+consLLC[consNameS[focusCons]].decl, 20, iY ); iY += 20; 
    ctx.fillText( "next: Space, prev: Shift+Space", 20, iY ); iY += 20; 
  }
}

//render();
setInterval( render, 1000/60 );