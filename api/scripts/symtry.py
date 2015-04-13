#!/usr/bin/env cctbx.python
import sys

from scitbx import matrix
from cctbx import crystal

cell = map(float, sys.argv[1:7])
sg = sys.argv[7]

symm = crystal.symmetry(cell, space_group=sg)
uc = symm.unit_cell()

frac = matrix.sqr(uc.fractionalization_matrix())
ortho = matrix.sqr(uc.orthogonalization_matrix())

for symop in symm.space_group().all_ops():
    rot = ortho * symop.r().as_rational() * frac
    tr = ortho * symop.t().as_rational()
    print rot[0], rot[1], rot[2], tr[0], rot[3], rot[4], rot[5], tr[1], rot[6], rot[7], rot[8], tr[2]
    #print ortho * symop.t().as_rational()