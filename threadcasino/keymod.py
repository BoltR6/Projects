def intoStringK(s):
  return ','.join(map(str, s))
def fetchArrayK(s):
  return s.split(',')
def addStringK(s,n):
  return s + "," + str(n)
def fetchValueK(s,n):
  return s.split(',')[n]
def editValueK(stringa,n,o):
  newS = fetchArrayK(stringa)
  newS[n] = o
  return intoStringK(newS)
def removeValueK(s,n):
  s.pop(n)
  return s


#                                     John W
