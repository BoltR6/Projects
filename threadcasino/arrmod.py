import random

def createF(dim):
	return [[0]*dim for _ in range(0,dim) ]
def scatterF(field,mines):
	ret_m = field
	ret_n = mines
	#print(ret_m)
	while ret_n > 0:
		x = random.randint(0,len(field) - 1)
		y = random.randint(0,len(field) - 1)
		#print(x,y,ret_n,ret_m[x][y])
		if (ret_m[y][x] == 0):
			ret_m[y][x] = 1
			ret_n -= 1
		#print(ret_m)
	return ret_m
def newF(dim, mines):
	k = createF(dim)
	return scatterF(k,mines)

def str2arr(str,sep):
	new = str.split(sep)
	newA = []
	for i in range(0, len(new)):
		newK = new[i].split("-")
		for ii in range(0, len(newK)):
			newK[ii] = int(newK[ii])
		newA.append(newK)
	return newA
def arr2str(arr, sep):
	finalStr = ""
	for i in range(0,len(arr)):
		sub = ""
		for k in range(0,len(arr[i]) ):
			if(k != len(arr[i])-1):
				sub += str(arr[i][k]) + "-"
			else:
				sub += str(arr[i][k])
		if(i != len(arr)-1):
			finalStr += sub + sep
		else:
			finalStr += sub
	return finalStr
def render(arr):
	for i in arr:
		full = ""
		for g in i:
			if( g == 0):
				full += " ?"
			elif( g == 1):
				full += " ?"
			elif( g == 2):
				full += " ."
			elif( g == 3):
				full += " X"
		print(full)

#	result_1 = str2arr("1,3,4+5,6,7","+")
#	print(result_1)
# ^ turns a string into a 2d array

#	result_2 = arr2str(result_1,"+")
#	print(result_2)
# ^ turns a 2d array into a string

#	result_3 = str2arr(result_2,"+")
#	print(result_3)
# ^ turns that string back into a 2d array


#                                     John W
