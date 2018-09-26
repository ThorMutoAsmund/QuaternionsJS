// Quaternion arithmetics
// Impl. by Thor Muto Asmund 2018
// See more here: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/

//
// Number extension
//
Number.prototype.toFixedDown = function(digits) {  
  return this.toFixed(digits);
};

Number.prototype.deg = function() {
  return this * Math.PI / 180;
};

//
// Console extension
//
console.xlog = function(s) {
  console.log(''+s)
};

//
// 3D Vector class
//
class V {
  constructor(x=0, y=0, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.precision = 8;
  }

  toFixedDown() {
    let e = this.precision;
    return new V(
      this.x.toFixedDown(e),
      this.y.toFixedDown(e),
      this.z.toFixedDown(e),
    );
  }
}

V.prototype.toString = function()
{
  let r = this.toFixedDown();
  return "V ( x: "+r.x+", y: "+r.y+", z: "+r.z+" }";
}

//
// 4D Vector class
//
class AA {
  constructor(x=0, y=0, z=0, t=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.t = t;
    this.precision = 8;
  }

  magnitude() {
    let a = this.x, b = this.y, c = this.z;
    return Math.sqrt(a*a + b*b + c*c);
  }

  normalize() {
    let n = this.magnitude();
    if (n == 0) return new AA(this.x,this.y, this.z, this.t);
    let a = this.x/n, b = this.y/n, c = this.z/n;
    let nt = this.t;
    while (nt <= -Math.PI) nt += 2*Math.PI;
    while (nt > Math.PI) nt -= 2*Math.PI;
    if (nt < 0) {
      nt = -nt;
      a = -a;
      b = -b;
      c = -c;
    }
    return new AA(
      a,
      b,
      c,
      nt
    );
  }
  
  toFixedDown() {
    let e = this.precision;
    return new AA(
      this.x.toFixedDown(e),
      this.y.toFixedDown(e),
      this.z.toFixedDown(e),
      this.t.toFixedDown(e),
    );
  }
}

AA.prototype.toString = function()
{
  let r = this.normalize();
  let tstar = (r.t/Math.PI);
  r.x*=tstar;
  r.y*=tstar;
  r.z*=tstar;
  r = r.toFixedDown();
  return "AA ( x*: "+r.x+", y*: "+r.y+", z*: "+r.z+" }";
}
AA.prototype.toStringRaw = function()
{
  let r = this.normalize();
  r = r.toFixedDown();
  return "AARAW ( x: "+r.x+", y: "+r.y+", z: "+r.z+", t*: "+(r.t/Math.PI)+" }";
}

//
// Quaternion class
//
class Q
{
  constructor(w=0, x=0, y=0, z=0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    this.precision = 8;
  }

  static fromRotation(axis, angle) {
    let s = Math.sin(angle/2.0);
    return new Q(
      Math.cos(angle/2),
      axis.x*s,
      axis.y*s,
      axis.z*s
    ).normalize();
  }

  static fromEulerAngles(v)
  {
    let roll=v.x, pitch = v.y, yaw = v.z;
    let cy = Math.cos(yaw * 0.5);
    let sy = Math.sin(yaw * 0.5);
    let cr = Math.cos(roll * 0.5);
    let sr = Math.sin(roll * 0.5);
    let cp = Math.cos(pitch * 0.5);
    let sp = Math.sin(pitch * 0.5);
  
    return new Q(
      cy * cr * cp + sy * sr * sp,
      cy * sr * cp - sy * cr * sp,
      cy * cr * sp + sy * sr * cp,
      sy * cr * cp - cy * sr * sp
    );
  }

  toFixedDown() {
    let e = this.precision;
    return new Q(
      this.w.toFixedDown(e),
      this.x.toFixedDown(e),
      this.y.toFixedDown(e),
      this.z.toFixedDown(e)
    );
  }

  add(other) {
    return new Q(
      this.w + other.w,
      this.x + other.x,
      this.y + other.y,
      this.z + other.z
    );
  }
  sub(other) {
    return new Q(
      this.w - other.w,
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  }
  mult(other) {
    let a = this.w, b = this.x, c = this.y, d = this.z;
    let e = other.w, f = other.x, g = other.y, h = other.z;
    return new Q(
      a*e - b*f - c*g - d*h,
      b*e + a*f + c*h - d*g,
      a*g - b*h+ c*e + d*f,
      a*h + b*g - c*f + d*e
    );
  }
  conj() {
    let a = this.w, b = this.x, c = this.y, d = this.z;
    return new Q(
      a,
      -b,
      -c,
      -d
    );
  }
  magnitude() {
    let a = this.w, b = this.x, c = this.y, d = this.z;
    return Math.sqrt(a*a + b*b + c*c + d*d);
  }
  normalize() {
    let a = this.w, b = this.x, c = this.y, d = this.z, n = this.magnitude();
    return new Q(
      a/n,
      b/n,
      c/n,
      d/n
    );
  }
  rotatePoint(p) {
    let r = this.mult(new Q(0, p.x, p.y, p.z)).mult(this.conj());
    return new V(r.x, r.y, r.z);
  }
  toEulerAngles() {
    let q = this;
    let sinr = 2.0 * (q.w * q.x + q.y * q.z);
    let cosr = 1.0 - 2.0 * (q.x * q.x + q.y * q.y);

    // roll (x-axis rotation)
    let roll = Math.atan2(sinr, cosr);

    // pitch (y-axis rotation)
    let pitch = 2.0 * (q.w * q.y - q.z * q.x);
    let copysign = function(x, y) {
      return y == 0.0 ? Math.abs(x) : Math.abs(x)*y / Math.abs(y);
    }
    if (Math.abs(pitch) >= 1) {
      pitch = copysign(Math.PI / 2, pitch); // use 90 degrees if out of range
    }
    else {
      pitch = Math.asin(pitch);
    }

    // yaw (z-axis rotation)
    let siny = 2.0 * (q.w * q.z + q.x * q.y),
      cosy = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);  
    let yaw = Math.atan2(siny, cosy);

    return new V(roll, pitch, yaw);
  }
  toAxisAngle() {
    let q = this;
    let angle = 2 * Math.acos(q.w);
    let d = Math.sqrt(1-q.w*q.w);
    if (d < 0.0001) {
      return new AA(1,0,0,0);
    }
    let x = q.x / d;
    let y = q.y / d;
    let z = q.z / d;
    return new AA(x,y,z,angle);
  }
}

Q.prototype.toString = function()
{
  let r = this.toFixedDown();
  return "Q ( "+r.w+" + "+r.x+" i + "+r.y+" j + "+r.z+" k }";
}

//
// Demo
//

function demo1()
{   
  let q1 = Q.fromRotation(new V(0,1,0), (45).deg());
  let q2 = Q.fromRotation(new V(0,1,0), (45).deg());
  let q = q1.mult(q2);
  let r = Q.fromRotation(new V(0,1,0), (90).deg());
  
  // Test toEulerAngles
  console.xlog(q);
  console.xlog(r);
  console.xlog(q.toEulerAngles());
  console.xlog(r.toEulerAngles());

  // Test rotatePoint
  let p = new V(3,0,1);
  console.xlog(q.rotatePoint(p));
  console.xlog(r.rotatePoint(p));

  // Test fromEulerAngles
  let e3 = new V((90).deg(),0,0);
  let q3 = Q.fromEulerAngles(e3);
  console.xlog(q3);
  console.xlog(e3);
  console.xlog(q3.toEulerAngles());
}

function testingAA()
{
  let a = [
    Q.fromRotation(new V(0,1,0), (120).deg()),
    Q.fromRotation(new V(0,1,0), (480).deg())];
  let b = a.map(v => v.toAxisAngle().normalize());

  console.log(a.map(v => v.toString()));
  console.log(b.map(v => v.toString()));
}

{
  let a = Q.fromRotation(new V(0,1,0), (0).deg());
  let b = Q.fromRotation(new V(0,1,0), (120).deg());
  let c = Q.fromRotation(new V(0,1,0), (240).deg());
  let d = a.mult(Q.fromRotation(new V(1,0,0), (120).deg()))
    .mult(Q.fromRotation(new V(0,0,1), (180).deg()));
  let q = [
    a,a.mult(Q.fromRotation(new V(0,0,1), (120).deg())),a.mult(Q.fromRotation(new V(0,0,1), (240).deg())),
    b,b.mult(Q.fromRotation(new V(0,0,1), (120).deg())),b.mult(Q.fromRotation(new V(0,0,1), (240).deg())),
    c,c.mult(Q.fromRotation(new V(0,0,1), (120).deg())),c.mult(Q.fromRotation(new V(0,0,1), (240).deg())),
    d,d.mult(Q.fromRotation(new V(0,0,1), (120).deg())),d.mult(Q.fromRotation(new V(0,0,1), (240).deg())),
  ];

  console.log(q.map(i => i.toAxisAngle().toString()));
}