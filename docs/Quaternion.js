var Rad = Math.PI/180.0;

var Quaternion = {};

Quaternion.qNorm = q => { return q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3]; };

Quaternion.qScalar = ( k, q ) => { return [k*q[0], k*q[1], k*q[2], k*q[3]]; };

Quaternion.qAdd = ( q1, q2 ) => { return [q1[0]+q2[0], q1[1]+q2[1], q1[2]+q2[2], q1[3]+q2[3]]; };

Quaternion.qMul = ( q1, q2 ) => {
  var a1 = q1[0], b1 = q1[1], c1 = q1[2], d1 = q1[3];
  var a2 = q2[0], b2 = q2[1], c2 = q2[2], d2 = q2[3];

  return [a1*a2-b1*b2-c1*c2-d1*d2, a1*b2+a2*b1+c1*d2-d1*c2, a1*c2-b1*d2+c1*a2+d1*b2, a1*d2+b1*c2-c1*b2+d1*a2];
};

Quaternion.qConj = q => { return [q[0], -q[1], -q[2], -q[3]]; };

Quaternion.qInv = q => { return Quaternion.qScalar( 1/Quaternion.qNorm(q), Quaternion.qConj(q) ); };

Quaternion.qPow = ( q, n ) => {
  if( n == -1 )
    return Quaternion.qInv(q);

  var alpha = Math.acos(q[0]), newalpha = alpha*n;
  var q2 = Quaternion.qScalar( Math.sin(newalpha)/Math.sin(alpha), q );
  q2[0] = Math.cos(newalpha);

  return q2;
};

Quaternion.vec2Q = v => { return [0, v[0], v[1], v[2]]; };

Quaternion.q2Vec = q => { return [q[1],q[2],q[3]]; };

Quaternion.rotQ = ( u, theta ) => { return [Math.cos(theta/2), Math.sin(theta/2)*u[0], Math.sin(theta/2)*u[1], Math.sin(theta/2)*u[2]]; };

Quaternion.defQ = Quaternion.rotQ( [0,0,0], 0 );

Quaternion.rotXQ = theta => { return Quaternion.rotQ( [1,0,0], theta ); };

Quaternion.rotYQ = theta => { return Quaternion.rotQ( [0,1,0], theta ); };

Quaternion.rotZQ = theta => { return Quaternion.rotQ( [0,0,1], theta ); };

Quaternion.applyQ = ( v, q ) => { return Quaternion.q2Vec( Quaternion.qMul( Quaternion.qMul( q, Quaternion.vec2Q(v) ), Quaternion.qConj(q) ) ); };

Quaternion.qSlerp = ( q1, q2, t ) => {
  if( Quaternion.qNorm( Quaternion.qAdd( q2, Quaternion.qScalar( -1, q1 ) ) ) > 0.00005 )
    return Quaternion.qMul( Quaternion.qPow( Quaternion.qMul( q2, Quaternion.qInv(q1) ), t ), q1 );
  else 
    return q2;
};