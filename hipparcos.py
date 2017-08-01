import sys

# |name      |ra           |dec          |parallax|lii         |bii         |vmag |bv_color|
'''
import urllib.request
from bs4 import BeautifulSoup
import math

html = urllib.request.urlopen( 'http://www.geocities.jp/p451640/hr_diagram/hrdiagram3.html' ).read()
soup = BeautifulSoup( html, 'lxml' )

xs = []

for item in soup.findAll('td'):
  xs += [item.text.strip()]

xs = xs[23:]

cols = []
for i in range(0,len(xs),4):
  cols += [list(map( float, [xs[i+1],xs[i+2],xs[i+3]] ))];

def deg2Rad(xs):
  h, m, s = map(float, xs.split(' '))
  sgn = 1 if h > 0 else -1

  return 15/180*3.14159265358979*(h+sgn*m/60+sgn*s/3600)

def deg2Rad2(xs):
  h, m, s = map(float, xs.split(' '))
  sgn = 1 if h > 0 else -1

  return (h+sgn*m/60+sgn*s/3600)/180*3.14159265358979

cnt = 0
s = "["

for line in sys.stdin:
  xs = line.split('|')[1:]

  fl = False
  for i in range(3,8):
    xs[i] = xs[i].strip()
    if len(xs[i]) == 0:
      fl = True

  if fl:
    continue

  bv = float(xs[7]);
  temp = 10**(3.939654 - 0.395361*bv + 0.2082113*bv*bv - 0.0604097*bv*bv*bv)

  X1 = 0
  Y1 = 0
  Z1 = 0

  for i in range(81):
    l = (380+5*i)
    X1 += cols[i][0]/l**5/(math.exp(1.439e7/l/temp)-1)
    Y1 += cols[i][1]/l**5/(math.exp(1.439e7/l/temp)-1)
    Z1 += cols[i][2]/l**5/(math.exp(1.439e7/l/temp)-1)    

  x = X1/(X1+Y1+Z1)
  y = Y1/(X1+Y1+Z1)

  Y = 1.0
  X = Y/y*x
  Z = Y/y*(1-x-y)

  R = 3.2410*X-1.5374*Y-0.4986*Z
  G = -0.9692*X+1.8760*Y+0.0416*Z
  B = 0.0556*X-0.2040*Y+1.0570*Z

  r = R*256
  g = G*256
  b = B*256

  #r = R**(1/2.2)*256
  #g = G**(1/2.2)*256
  #b = B**(1/2.2)*256

  x = 0
  if temp > 1667 and temp < 4000:
    x = -0.2661239*10**9/temp/temp/temp-0.2343580*10**6/temp/temp+0.8776956*10**3/temp+0.179910
  elif temp > 4000 and temp < 25000:
    x = -3.0258469*10**9/temp/temp/temp+2.1070379*10**6/temp/temp+0.2226347*10**3/temp+0.240390

  y = 0
  if temp > 1667 and temp < 2222:
    y = -1.1063814*x**3-1.34811020*x**2+2.18555832*x-0.20219683 
  elif temp > 2222 and temp < 4000:
    y = -0.9549476*x**3-1.37418593*x**2+2.09137015*x-0.16748867 
  elif temp > 4000 and temp < 25000:
    y = +3.0817580*x**3-5.87338670*x**2+3.75112997*x-0.37001483 


  #rgbS = "{}{}{}".format(r,g,b)

  #if not rgbS.isdecimal():
   # print(rgbS)

  s += "{" + "num:{},ra:{},decl:{},par:{},long:{},lat:{},vmag:{},bv:{},temp:{},r:{},g:{},b:{}".format(xs[0][4:].strip(),deg2Rad(xs[1]),deg2Rad2(xs[2]),xs[3],xs[4],xs[5],xs[6],xs[7],temp,r,g,b) + "},"

s = s[:-1]
s += "]"

print(s)

'''
s = "["

nameS = []

for line in sys.stdin:
  xs = line.strip().split(',')

  '''ys = []
  for x in xs:
    if x != '':
      ys += [x]

  xs = ys'''

  #s += "{" + "num:{},code:\"{}\",cons:\"{}\"".format(xs[0].strip(),xs[1].strip(),xs[2].strip()) + "},"
  #s += "{" + "num:{},name:\"{}\"".format(xs[0].strip(),xs[1].strip()) + "},"
  #s += "{" + "name:\"{}\",num1:{},num2:{}".format(xs[0].strip(),xs[1].strip(),xs[2].strip()) + "},"
  #s += "{" + "engName:\"{}\",jpName:\"{}\"".format(' '.join(xs[3:-1]),xs[-1]) + "},";
  if len(nameS) == 0 or nameS[len(nameS)-1] != xs[0]:
    nameS += [xs[0]];

for e in nameS:
  s += "\"" + e + "\"" + ","

s = s[:-1]
s += "]"

print(s)