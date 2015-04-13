/*
 * Initially based on Three.js's implementation of Marching Cubes by
 *  alteredq http://alteredqualia.com/
 *  http://github.com/mrdoob/three.js/blob/master/examples/js/MarchingCubes.js
 * 
 * , which is port of greggman's ThreeD version of marching cubes to Three.js
 * http://webglsamples.googlecode.com/hg/blob/blob.html
 *
 * Then @biochem_fan modified it into Marching Squares as implemented in
 *  Cuemol http://www.cuemol.org/ja/.
 */

THREE.MarchingCubes = function (map, nc, nr, ns, ncstart, nrstart, nsstart) {
   this.init = function() {
      this.geo = new THREE.Geometry();
      this.vertices = this.geo.vertices;
      this.ncstart = ncstart, this.nrstart = nrstart, this.nsstart = nsstart;

      this.size = nc;
      this.size2 = this.size * nr;
      this.size3 = this.size2 * ns;

      this.yd = this.size;
      this.zd = this.size2;

      this.vlist = new Float32Array( 12 * 3 );
      this.field = map;

      this.count = 0;
   };

   this.VIntX = function(pout, offset, isol, x, y, z, valp1, valp2 ) {
      pout[offset] = x + (isol - valp1) / (valp2 - valp1);
      pout[offset + 1] = y;
      pout[offset + 2] = z;
   };

   this.VIntY = function(pout, offset, isol, x, y, z, valp1, valp2) {
      pout[offset] = x;
      pout[offset + 1] = y + (isol - valp1) / (valp2 - valp1);
      pout[offset + 2] = z;
   };

   this.VIntZ = function(pout, offset, isol, x, y, z, valp1, valp2) {
      pout[offset] = x;
      pout[offset + 1] = y;
      pout[offset + 2] = z + (isol - valp1) / (valp2 - valp1);
   };

   this.polygonizeYZ = function(fx, fy, fz, q, isol) {
      var q1 = q + this.zd, // TODO: fix variable names!
          qy = q + this.yd,
          q1y = q1 + this.yd;

      var cubeindex = 0,
          field0 = this.field[ q ],
          field1 = this.field[ q1 ],
          field2 = this.field[ qy ],
          field3 = this.field[ q1y ];

      var s0 = ((field1 - isol) * (field0 - isol) > 0) ? 0 : 1,
          s1 = ((field3 - isol) * (field1 - isol) > 0) ? 0 : 1,
          s2 = ((field2 - isol) * (field3 - isol) > 0) ? 0 : 1,
          s3 = ((field0 - isol) * (field2 - isol) > 0) ? 0 : 1;
      var fz2 = fz + 1, fy2 = fy + 1;

      if (s0 == 0 && s1 == 0 && s2 == 0 && s3 == 0) return;
      if (s0 != 0 && s1 != 0 && s2 != 0 && s3 != 0) {
         this.VIntZ(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntZ(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
         this.VIntY(this.vlist, 6, isol, fx, fy, fz2, field1, field3); // s1
         this.VIntY(this.vlist, 9, isol, fx, fy, fz, field0, field2); // s3
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[6], this.vlist[7], this.vlist[8]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[9], this.vlist[10], this.vlist[11]));
         return;
      }

      if (s0 != 0 && s1 == 0 && s2 != 0 && s3 == 0) {
         this.VIntZ(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntZ(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
      } else if (s0 == 0 && s1 != 0 && s2 == 0 && s3 != 0) {
         this.VIntY(this.vlist, 0, isol, fx, fy, fz2, field1, field3); // s1
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 == 0 && s2 != 0 && s3 != 0) {
         this.VIntZ(this.vlist, 0, isol, fx, fy2, fz, field2, field3); // s2
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 != 0 && s2 != 0 && s3 == 0) {
         this.VIntY(this.vlist, 0, isol, fx, fy, fz2, field1, field3); // s1
         this.VIntZ(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
      } else if (s0 != 0 && s1 != 0 && s2 == 0 && s3 == 0) {
         this.VIntZ(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntY(this.vlist, 3, isol, fx, fy, fz2, field1, field3); // s1
      } else if (s0 != 0 && s1 == 0 && s2 == 0 && s3 != 0) {
         this.VIntZ(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      }

      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
  };

   this.polygonizeXY = function(fx, fy, fz, q, isol) {
      var q1 = q + 1,
          qy = q + this.yd,
          q1y = q1 + this.yd;

      var cubeindex = 0,
          field0 = this.field[ q ], // x, y, z
          field1 = this.field[ q1 ], // x + 1, y, z
          field2 = this.field[ qy ], // x, y + 1, z
          field3 = this.field[ q1y ]; // x + 1, y + 1, z

      var s0 = ((field1 - isol) * (field0 - isol) > 0) ? 0 : 1,
          s1 = ((field3 - isol) * (field1 - isol) > 0) ? 0 : 1,
          s2 = ((field2 - isol) * (field3 - isol) > 0) ? 0 : 1,
          s3 = ((field0 - isol) * (field2 - isol) > 0) ? 0 : 1;
      var fx2 = fx + 1, fy2 = fy + 1;

      if (s0 == 0 && s1 == 0 && s2 == 0 && s3 == 0) return;
      if (s0 != 0 && s1 != 0 && s2 != 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntX(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
         this.VIntY(this.vlist, 6, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntY(this.vlist, 9, isol, fx, fy, fz, field0, field2); // s3
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[6], this.vlist[7], this.vlist[8]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[9], this.vlist[10], this.vlist[11]));
         return;
      }

      if (s0 != 0 && s1 == 0 && s2 != 0 && s3 == 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntX(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
      } else if (s0 == 0 && s1 != 0 && s2 == 0 && s3 != 0) {
         this.VIntY(this.vlist, 0, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 == 0 && s2 != 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy2, fz, field2, field3); // s2
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 != 0 && s2 != 0 && s3 == 0) {
         this.VIntY(this.vlist, 0, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntX(this.vlist, 3, isol, fx, fy2, fz, field2, field3); // s2
      } else if (s0 != 0 && s1 != 0 && s2 == 0 && s3 == 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntY(this.vlist, 3, isol, fx2, fy, fz, field1, field3); // s1
      } else if (s0 != 0 && s1 == 0 && s2 == 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntY(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      }

      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
  };

   this.polygonizeXZ = function(fx, fy, fz, q, isol) {
      var q1 = q + 1,
          qy = q + this.zd,
          q1y = q1 + this.zd;

      var cubeindex = 0,
          field0 = this.field[ q ],
          field1 = this.field[ q1 ],
          field2 = this.field[ qy ],
          field3 = this.field[ q1y ];

      var s0 = ((field1 - isol) * (field0 - isol) > 0) ? 0 : 1,
          s1 = ((field3 - isol) * (field1 - isol) > 0) ? 0 : 1,
          s2 = ((field2 - isol) * (field3 - isol) > 0) ? 0 : 1,
          s3 = ((field0 - isol) * (field2 - isol) > 0) ? 0 : 1;
      var fx2 = fx + 1, fz2 = fz + 1;

      if (s0 == 0 && s1 == 0 && s2 == 0 && s3 == 0) return;
      if (s0 != 0 && s1 != 0 && s2 != 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntX(this.vlist, 3, isol, fx, fy, fz2, field2, field3); // s2
         this.VIntZ(this.vlist, 6, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntZ(this.vlist, 9, isol, fx, fy, fz, field0, field2); // s3
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[6], this.vlist[7], this.vlist[8]));
         this.vertices[this.count++] = (new THREE.Vector3(this.vlist[9], this.vlist[10], this.vlist[11]));
         return;
      }

      if (s0 != 0 && s1 == 0 && s2 != 0 && s3 == 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntX(this.vlist, 3, isol, fx, fy, fz2, field2, field3); // s2
      } else if (s0 == 0 && s1 != 0 && s2 == 0 && s3 != 0) {
         this.VIntZ(this.vlist, 0, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntZ(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 == 0 && s2 != 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz2, field2, field3); // s2
         this.VIntZ(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      } else if (s0 == 0 && s1 != 0 && s2 != 0 && s3 == 0) {
         this.VIntZ(this.vlist, 0, isol, fx2, fy, fz, field1, field3); // s1
         this.VIntX(this.vlist, 3, isol, fx, fy, fz2, field2, field3); // s2
      } else if (s0 != 0 && s1 != 0 && s2 == 0 && s3 == 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntZ(this.vlist, 3, isol, fx2, fy, fz, field1, field3); // s1
      } else if (s0 != 0 && s1 == 0 && s2 == 0 && s3 != 0) {
         this.VIntX(this.vlist, 0, isol, fx, fy, fz, field0, field1); // s0
         this.VIntZ(this.vlist, 3, isol, fx, fy, fz, field0, field2); // s3
      }

      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[0], this.vlist[1], this.vlist[2]));
      this.vertices[this.count++] = (new THREE.Vector3(this.vlist[3], this.vlist[4], this.vlist[5]));
  };

   this.build = function(cc, cr, cs, radius) {
      var q, x, y, z,  y_offset, z_offset;
      var xlo = cc - radius, xhi = cc + radius, 
          ylo = cr - radius, yhi = cr + radius,
          zlo = cs - radius, zhi = cs + radius;
      if (xlo < 0) xlo = 0;
      if (ylo < 0) ylo = 0;
      if (zlo < 0) zlo = 0;
      if (xhi > nc - 2) xhi = nc - 2;
      if (yhi > nr - 2) yhi = nr - 2;
      if (zhi > ns - 2) zhi = ns - 2;
      console.log('Mesh Range: ', xlo, xhi, ylo, yhi, zlo, zhi);

      for (z = zlo; z <= zhi ; z++) {
         z_offset = this.size2 * z;
         for (y = ylo; y <= yhi; y ++) {
            y_offset = z_offset + this.size * y;
            for (x = xlo; x <= xhi; x ++) {
               q = y_offset + x;
               this.polygonizeXY((x + ncstart), (y + nrstart),  (z + nsstart), q, this.isol);
               this.polygonizeYZ((x + ncstart), (y + nrstart),  (z + nsstart), q, this.isol);
               this.polygonizeXZ((x + ncstart), (y + nrstart),  (z + nsstart), q, this.isol);
            }
         }
      }
   };

    this.generateGeometry = function(cc, cr, cs, radius, isol) {
      this.count = 0;
      this.isol = isol; this.cc = cc; this.cr = cr, this.cs = cs;
      var maxvert = 2500000, i = 0;

      this.vertices.length = maxvert;
      this.build(cc, cr, cs, radius);
      var dummy = new THREE.Vector3(0, 0, 0);
      for (i = this.count; i < maxvert; i++) this.vertices[i] = dummy;

      // TODO: FIXME: if this.count > maxvert, Geometry object has to be rebuilded,
      //  since Three.js doesn't support changes of vertex counts.
      this.geo.verticesNeedUpdate = true;

      return this.geo;
   };

   this.init();
};

