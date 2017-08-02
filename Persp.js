function matMul( m1, m2 )
{
  var ret = [];
  var m = m1.length, n = m2[0].length;

  for( var i = 0; i < m; ++i )
  {
    ret.push([]);
    
    for( var j = 0; j < n; ++j )
      ret[i].push(0);
  }

  for( var i = 0; i < m; ++i ) for( var j = 0; j < n; ++j ) for( var k = 0; k < m1[0].length; ++k )
    ret[i][j] += m1[i][k]*m2[k][j];

  return ret;
}

function matInv( m )
{
  var det = m[0][0]*m[1][1]*m[2][2]+m[1][0]*m[2][1]*m[0][2]+m[2][0]*m[0][1]*m[1][2]-m[0][0]*m[2][1]*m[1][2]-m[2][0]*m[1][1]*m[0][2]-m[1][0]*m[0][1]*m[2][2];
  var ret = [[m[1][1]*m[2][2]-m[1][2]*m[2][1],m[0][2]*m[2][1]-m[0][1]*m[2][2],m[0][1]*m[1][2]-m[0][2]*m[1][1]],[m[1][2]*m[2][0]-m[1][0]*m[2][2],m[0][0]*m[2][2]-m[0][2]*m[2][0],m[0][2]*m[1][2]-m[0][0]*m[1][2]],[m[1][0]*m[2][1]-m[1][1]*m[2][0],m[0][1]*m[2][0]-m[0][0]*m[2][1],m[0][0]*m[1][1]-m[0][1]*m[1][0]]];

  for( var i = 0; i < 3; ++i ) for( var j = 0; j < 3; ++j )
    ret[i][j] /= det;

  return ret;
}

function norm( v )
{ return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); }

function persp( xyz, xc, yc, zc, a, b, c, nx, ny, nz )
{
  var x = xyz[0], y = xyz[1], z = xyz[2];
  var t = (a*a+b*b+c*c)/(a*(x-xc)+b*(y-yc)+c*(z-zc));
  var pCrd = [[t*(x-xc)-a],[t*(y-yc)-b],[t*(z-zc)-c]];
  var normABC = norm([a,b,c]), normN = norm([nx,ny,nz]);

  a /= normABC;
  b /= normABC;
  c /= normABC;
  nx /= normN;
  ny /= normN;
  nz /= normN;

  var v = Quaternion.applyQ( [nx,ny,nz], Quaternion.rotQ( [a,b,c], -Math.PI/2 ) );
  
  var ret = matMul([[nx,ny,nz],v,[a,b,c]], pCrd);

  return [ret[0][0],ret[1][0],ret[2][0]];
}