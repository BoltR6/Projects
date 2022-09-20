#threadcasino -v0.1.0
#  CCA
#  18+
#
#
#  by John W

import datetime
import time
import traceback
import replit
import random
import sys
import math
import numpy
import keymod
import pymongo
import arrmod

ver = 0
replit.clear()
nind = 0
name = ""
w1 = False

over = pymongo.MongoClient(
    "REMOVED FOR SECURITY")
overdb = over["user"]
colC = overdb["username"]

def freeIndex(c):
    for i in range(0, 100000):
        if (c.find_one({"_id": i}) == None):
            return i
    return
def getField(f):  
    return colC.find_one({"_id": ver})[f]
def setField(f, v):
    colC.update_one({"_id": ver}, {"$set": {f: v}})
def addToField(f, v):
    colC.update_one({"_id": ver}, {"$set": {f: str(getField(f) + "," + v)}})
def delItemFromField(f, i):
    nF = getField(f).split(',')
    nF.pop(i)
    print("\n" + str(nF))
    setField(f, ','.join(nF))
def newUser(usrnme, passw, money, last, code):
    addToField('Usernames', usrnme)
    addToField('Passwords', passw)
    addToField('Money', money)
    addToField('Last', last)
    addToField("Code", code)
def convDel():
	setField('Usernames', '')
	setField('Passwords', '')
	setField('Money', '')
	setField('Last', '')
	setField("FCO", "plus5,15bucks")
	setField("FCOE", "0.05,15.00")
	setField("RCO", "bolt")
	setField("RCOE", "0")
	setField("Code", "")
	setField("InRL", "")
	setField("TABRL", "")
	setField("MRL", "")
	setField("LastRL", "")
	setField("NetG", "")
	setField("LandMap","base")
	setField("LandPlay","base")
	setField("LandPlay2","base")
	setField("LandBet","base")
	setField("LandTurn","base")

def cA(y2):
    replit.clear()
    if (y2 == "none"):
        print("New username: ")
        x = str(input())
        replit.clear()
        if (x.find("24343") != -1):
            print("24343 not ok. :)")
            time.sleep(5)
            cA("none")
    else:
        x = y2
    if (x.lower() in keymod.fetchArrayK(getField('Usernames'))):
      print("Username in use")
      time.sleep(1)
      replit.clear()
      uI()
      return False
    print("New password: ")
    y = str(input())
    replit.clear()
    print("Confirm password: ")
    z = str(input())
    replit.clear()
    if (y == z):
        addToField('Usernames', x)
        addToField('Passwords', y)
        addToField('Last', "")
        addToField('Money', '10')
        addToField('Code', '')
        addToField('InRL', "")
        addToField('TABRL', "")
        addToField('MRL', "")
        addToField('NetG', "0")
        print("Success")
        time.sleep(2)
        replit.clear()
        uI()
        return True
    else:
        print("Passwords did not match")
        cA(x)
def dA():
    replit.clear()
    print("Username? ")
    x = input()
    replit.clear()
    if (x.find("24343") != -1):
        print(">:(")
        uI()
        return False
    if (x in keymod.fetchArrayK(getField("Usernames")) and x != ''):
        ind = keymod.fetchArrayK(getField("Usernames")).index(x)
        pw = keymod.fetchArrayK(getField("Passwords"))[ind]
        print("Password?")
        y = input()
        replit.clear()
        if (pw == y):
            print("Confirm? (This will delete your account)")
            z = input()
            replit.clear()
            if (y == z):
                setField("Usernames",keymod.intoStringK(
                    keymod.removeValueK(keymod.fetchArrayK(getField("Usernames") ), ind)))
                setField("Passwords",keymod.intoStringK(
                    keymod.removeValueK(
                        keymod.fetchArrayK(getField("Passwords")), ind)))
                setField("Code",keymod.intoStringK(
                    keymod.removeValueK(keymod.fetchArrayK(getField("Code")), ind)))
                setField("Last",keymod.intoStringK(
                    keymod.removeValueK(keymod.fetchArrayK(getField("Last")), ind)))
                setField("Money",keymod.intoStringK(
                    keymod.removeValueK(keymod.fetchArrayK((getField("Money"))), ind)))
                print("Account deleted.")
                time.sleep(2)
                uI()
            else:
                print("Password did not match.")
                uI()
                return False
        else:
            print("Password did not match.")
            uI()
            return False
    else:
        print("Account does not exist.")
        time.sleep(2)
        uI()
def lA():
    replit.clear()
    try:
        print("Username")
        x = input()
        replit.clear()
        if (x in keymod.fetchArrayK(getField("Usernames")) and x != ''):
            ind = keymod.fetchArrayK(getField("Usernames")).index(x)
            pw = keymod.fetchArrayK(getField("Passwords"))[ind]
            print("Password")
            y = input()
            replit.clear()
            if (pw == y):
                print("Success")
                global name
                global nind
                nind = ind
                name = x
                setField("InRL",keymod.editValueK(getField("InRL"),nind,""))
                setField("TABRL",keymod.editValueK(getField("TABRL"),nind,""))
                setField("MRL",keymod.editValueK(getField("MRL"),nind,""))
                time.sleep(2)
                return
            else:
                replit.clear()
                print("Incorrect Password. \n")
                time.sleep(2)
                uI()
                return False
        else:
            #print(e)
            print("Account does not exist.")
            time.sleep(2)
            uI()
    except KeyError as e:
        print("Unknown error. \n" + e)
        lA()
def uI():
    replit.clear()
    print("threadcasino\n\n\n1: New\n2: Delete\n3: Login")
    x = str(input())
    if (x == "1"):
        cA("none")
        return True
    elif (x == "2"):
        dA()
        return True
    elif (x == "3"):
        lA()
    else:
        replit.clear()
        uI()
    """
		elif (x == "diamond"):
        replit.clear()
        print("Usernames: " + getField("Usernames"))
        print("Passwords: " + getField("Passwords"))
        print("Code: " + getField("Code"))
        print("Last: " + getField("Last"))
        print("FCO: " + getField("FCO"))
        print("FCOE: " + getField("FCOE"))
        print("RCO: " + getField("RCO"))
        print("RCOE: " + getField("RCOE"))
        print("Money: " + getField("Money"))
        print("InRL: " + getField("InRL"))
        print("TABRL: " + getField("TABRL"))
        print("MRL: " + getField("MRL"))
        print("NetG: " + getField("NetG"))
        print("LandMap: " + getField("LandMap"))
        print("LandPlay: " + getField("LandPlay"))
        print("LandPlay2: " + getField("LandPlay2"))
        print("LandTurn: " + getField("LandTurn"))
        print("LandBet: " + getField("LandBet"))
        input()
        uI()
    elif (x == "diamond2"):
        replit.clear()
        convDel()
        input()
        uI()"""

def rT(n, nn):
    return round(n * (10**nn)) / (10**nn) if nn != 0 else n
def cN(v, mv, mav):
    return min(mav, max(mv, v))
def gClear():
    replit.clear()
    setField("Money",keymod.editValueK(
        getField("Money"), nind,
        round(float(keymod.fetchArrayK(getField("Money"))[nind]) * 100) / 100))

    print(name.upper() + ": $" + str(keymod.fetchArrayK(getField("Money"))[nind]) +
          " " + str(keymod.fetchArrayK(getField("Last"))[nind]))
def nInput():
    x = input()
    if (x.lower() == "u"):
        global name
        name = ""
        uI()
    else:
        return x

def rD(s, m, f, c):
    if (f):
        v, ta, nm = random.randint(
            1, int(s)), [10, 7, 5, 3, 2, 1, 0.5, 0.2, 0.1, 0.01], m
        while (nm > 0):
            if (c == False):
                print(random.randint(1, int(s)))
            else:
                if (random.randint(1, 2) == 1):
                    print("Heads")
                else:
                    print("Tails")
            if (nm < len(ta)):
                time.sleep(ta[nm] / 10)
            else:
                time.sleep(0.01)
            nm -= 1
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
        if (c == False):
            print(v)
        else:
            if (v == 1):
                print("Heads")
            else:
                print("Tails")
        time.sleep(0.5)
        return v
    else:
        return random.randint(1, int(s))
def tD(ss, n, f):
    a = []
    for x in range(0, cN(int(n), 1, math.inf)):
        m = rD(cN(ss, 1, math.inf), 90, f)
        if (f):
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            print("Dice #" + str(x + 1) + ": " + str(m))
        a.append(m)
    if (f):
        for x in range(0, cN(int(n), 1, math.inf)):
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
        time.sleep(3)
    return a
def sD(aa):
    an = 0
    for i in range(0, len(aa)):
        an += aa[i]
    return an
def aD(ab, p):
    x, y = 0, 0
    for z in ab:
        x += 1
        y += z
    return rT(y / x, p)

def bA():
    try:
        gClear()

        print("\nWhat odds do you want?")
        o = int(input())
        if (o <= 2):
            print("Must be larger than 2.")
            time.sleep(2)
            bA()
            return False

        print("What number do you choose to win on? (1-" + str(o) + ")")
        om = int(input())
        if (om > o or om < 1):
            print("Not a legal value. Autoselect: " + str(cN(om, 1, o)))
            om = cN(om, 1, o)

        print("How much do you bet?")
        m = float(input())
        if (m < 0.01):
            m = cN(m, 0.01, 10)
            gClear()
            print("\nValue was less than 0.01. \nInput has been set to 0.01.")
            time.sleep(2)
        if (m > float(keymod.fetchArrayK(getField("Money"))[nind])):
            m = cN(m, 0, float(keymod.fetchArrayK(getField("Money"))[nind]))
            gClear()
            print(
                "\nValue was greater than balance\nBet has been set to max instead"
            )
            time.sleep(2)

        setField("Money",keymod.editValueK(
            getField("Money"), nind,
            (float(keymod.fetchArrayK(getField("Money"))[nind]) - float(m))))
        setField("NetG",keymod.editValueK(
            getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(m))))
        setField("Last",keymod.editValueK(getField("Last"), nind,
                                       "(-$" + str(round(m * 100) / 100) + ")"))
        gClear()

        print("You have a 1/" + str(o) + " chance of winning on " + str(om) +
              ". \nDoing so nets you $" + str(m * o) + ".\n\n")
        oC = rD(o, 500, True, False)
        if (int(oC) == int(om)):
            print("You won $" + str(m * o) + ", balance has been updated.")
            setField("Money",keymod.editValueK(
                getField("Money"), nind,
                (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(m * o))))
            setField("NetG",keymod.editValueK(
            getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(m*o))))
            setField("Last",keymod.editValueK(
                getField("Last"), nind, "(+$" + str(round(m * o * 100) / 100) + ")"))
            time.sleep(3)
            mU()
            return True
        else:
            print("You lost, returning to menu.")
            time.sleep(3)
            mU()
            return True
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def cO():
    try:
        gClear()

        print(
            "\nWhat number do you choose to win on? \n(1 = heads, 2 = tails)")
        om = int(input())
        if (om > 2 or om < 1):
            gClear()
            print("\nMust be 1 or 2. Autoselect: " + str(cN(om, 1, 2)))
            om = cN(om, 1, 2)
            time.sleep(2)
        gClear()

        print("\nHow much do you bet? $")
        m = float(input())
        if (m < 0.01):
            m = cN(m, 0.01, 10)
            gClear()
            print("\nValue was less than 0.01. \nInput has been set to 0.01.")
            time.sleep(2)
        if (m > float(keymod.fetchArrayK(getField("Money"))[nind])):
            m = cN(m, 0, float(keymod.fetchArrayK(getField("Money"))[nind]))
            gClear()
            print("\nValue was greater than balance.\nBet is now max possible")
            time.sleep(4)

        #keymod.fetchArrayK(db["passwords"])[ind]
        setField("Money",keymod.editValueK(
            getField("Money"), nind,
            (float(keymod.fetchArrayK(getField("Money"))[nind]) - float(m))))
        setField("NetG",keymod.editValueK(
            getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(m))))
        setField("Last",keymod.editValueK(getField("Last"), nind,
                                       "(-$" + str(round(m * 100) / 100) + ")"))
        gClear()

        print("\nYou have a 50% chance of winning on " + str(om) +
              ". \n(1: Heads, 2: Tails) \n\nDoing so nets you $" + str(m * 2) +
              ".\n\n")
        oC = rD(2, 500, True, True)
        if (int(oC) == int(om)):
            #db[hash+name] = str( float(db[hash+name]) + float(m*2) )
            setField("Money",keymod.editValueK(
                getField("Money"), nind,
                (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(m * 2))))
            setField("NetG",keymod.editValueK(
            getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(m*2))))
            setField("Last",keymod.editValueK(
                getField("Last"), nind, "(+$" + str(round(m * 200) / 100) + ")"))
            print("You won $" + str(m * 2) + ", balance has been updated.")
            time.sleep(3)
            mU()
            return True
        else:
            print("You lost, returning to menu.")
            time.sleep(3)
            mU()
            return True
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def cG():
    try:
        global last
        gClear()
        seed = 1.003

        print("\nAt what point do you wish to cash out?")
        cO = round(float(input()) * 100) / 100
        if (cO < 1.01):
            cO = cN(cO, 1.01, 10)
            gClear()
            print("\nValue was less than 1.01. \nInput has been set to 1.01.")
            time.sleep(2)
        gClear()

        print("\nHow much are you betting? $")
        mO = round(float(input()) * 100) / 100
        if (mO < 0.01):
            mO = cN(mO, 0.01, 10)
            gClear()
            print("\nValue was less than 0.01. \nInput has been set to 0.01.")
            time.sleep(2)
        if (mO > float(keymod.fetchArrayK(getField("Money"))[nind])):
            mO = cN(mO, 0, float(keymod.fetchArrayK(getField("Money"))[nind]))
            gClear()
            print(
                "\nValue was greater than balance\aBet has been set to max instead"
            )
            time.sleep(2)

        replit.clear()

        time.sleep(1)
        randomTime = numpy.random.gamma(1, 5.0) * 3
        f = int(datetime.datetime.utcnow().strftime("%s"))

        setField("Money",keymod.editValueK(
            getField("Money"), nind,
            (float(keymod.fetchArrayK(getField("Money"))[nind]) - float(mO))))
        setField("NetG",keymod.editValueK(
            getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(mO))))
        setField("Last",keymod.editValueK(
            getField("Last"), nind, "(-$" + str(round(mO * 100) / 100) + ")"))
        gClear()

        #print("Continue for: "+ str(randomTime))
        #print(f)
        #-1
        print("\n")
        print("")
        for i in range(0, 10000):
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            time.sleep(0.03)

            seed += math.pow(seed, i / 15807.53) - 1
            now = int(datetime.datetime.utcnow().strftime("%s"))

            print(str(round(seed * 100) / 100) + "x")
            print("($" +
                  str(round((round(seed * 100) / 100) * mO * 100) / 100) + ")")

            if (cO <= round(seed * 100) / 100):
                if (name in keymod.fetchArrayK(getField("RCO")) and mO >= 0.5
                        and cO > 3.5):
                    xi = keymod.fetchArrayK(getField("RCO")).index(name)
                    mmm = int(keymod.fetchArrayK(getField("RCOE"))[xi])
                    setField("Money",keymod.editValueK(
                        getField("Money"), nind,
                        (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(
                            round((mO * cO + mmm * 0.01 * cO) * 100) / 100))))
                    setField("NetG",keymod.editValueK(
            				getField("NetG"), nind,
            (float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(
                            round((mO * cO + mmm * 0.01 * cO) * 100) / 100))))
                    setField("Last",keymod.editValueK(
                        getField("Last"), nind, "(+$" +
                        str(round(
                            (mO * cO + mmm * 0.01 * cO) * 100) / 100) + ")"))
                    gClear()
                    print("(+$" + str(round(mmm * 0.01 * cO * 100) / 100) +
                          " extra from affiliate)")
                else:
                    setField("Money",keymod.editValueK(
                        getField("Money"), nind,
                        (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(
                            round(mO * cO * 100) / 100))))
                    setField("NetG",keymod.editValueK(
                        getField("NetG"), nind,
                        (float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(
                            round(mO * cO * 100) / 100))))
                    setField("Last",keymod.editValueK(
                        getField("Last"), nind,
                        "(+$" + str(round(mO * cO * 100) / 100) + ")"))
                    gClear()
                print("\n" + str(cO) + "x")
                print("\nYou didn't crash! \nYou win $" +
                      str(round(mO * cO * 100) / 100) + " off of $" + str(mO))

                print("\n\nReturning to menu after input")
                input()
                mU()
                break
            if (int(datetime.datetime.utcnow().strftime("%s")) > f + randomTime + 3):
                gClear()
                print("\n" + str(round(seed * 100) / 100))
                print("\nYou crashed\n\nReturning to menu after input")
                input()
                mU()
                break
    except Exception as e:
        replit.clear()
        traceback.print_exc()

        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def sB():
    gClear()

    print("\nFetching Data...")
    a = keymod.fetchArrayK(getField("Money"))
    ab = keymod.fetchArrayK(getField("RCOE"))
    ab2 = keymod.fetchArrayK(getField("NetG"))
    hV = 0
    lV = 1000000000000000000000000000000000000000000000000000000000000
    nU = 0
    aV = 0
    aC = 0
    hNG = 0
    time.sleep(0.35)
    for i in a:
        if (i != ''):
            if (float(i) > hV):
                hV = float(i)
            if (float(i) < lV):
                lV = float(i)
            aV += float(i)
            nU += 1
    gClear()
    for ix in range(0, len(ab)):
        if (ab[ix] != ''):
            if (float(ab[ix]) > aC):
                aC = float(ab[ix])
    for ixx in range(0, len(ab2)):
        #print(ab2[ixx])
        if (ab2[ixx] != ''):
            if (float(ab2[ixx]) > hNG):
                hNG = float(ab2[ixx])
    print("\nYour Net Gain: $"+str(round(float(keymod.fetchArrayK(getField("NetG"))[nind])*100)/100)+"\n\nUsers: " + str(int(nU)) + "\nHighest Referrals: " + str(int(aC)) +
          "\nHighest Balance: $" + str(round(hV * 100) / 100) +
          "\nHighest Net Gain: $" + str(round(float(hNG) * 100) / 100) + "\nLowest Balance: $" + str(round(lV * 100) / 100) +
          "\nAverage Balance: $" + str(round(aV / nU * 100) / 100))
    print("\n\nReturning to menu after input")
    input()
    mU()

def bRl():
	gClear()
	print("\n1 for Join Roulette\n2 for Watch Roulette")
	i = input()
	if(i == '1'):
		rL("")
	elif(i == '2'):
		wrL()
	else:
		bRl()
def rL(nU):
	try:
		gClear()
		print("")
		if(nU == ""):
			print("Welcome to Roulette.\n\nWhat do you wish to place on?\nRed (2x), Blue (2x), Gold (14x)")
			placO = input().lower()
			if(placO != 'red' and placO != 'blue' and placO != 'gold'):
				rL("")
				return
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
		else:
			placO = nU.lower()
		
		try:
			print("What do you bet?")
			betO = round(float(input())*100)/100
			if(float(betO) > float(keymod.fetchArrayK(getField("Money"))[nind])):
				gClear()
				print("\nYour bet $"+str(betO)+" is more than your balance, $"+str(keymod.fetchArrayK(getField("Money"))[nind]))
				time.sleep(2.5)
				rL(placO)
				return
			elif(float(betO) < 0.01):
				gClear()
				print("\nYour bet $"+str(betO)+" must be larger than $0.01.")
				time.sleep(2.5)
				rL(placO)
				return
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
		except Exception:
			rL(placO)
		
		setField("InRL",keymod.editValueK(getField("InRL"),nind,name))
		setField("TABRL",keymod.editValueK(getField("TABRL"),nind,str(placO)))
		setField("MRL",keymod.editValueK(getField("MRL"),nind,str(betO)))
		setField("Money",keymod.editValueK(getField("Money"), nind,(float(keymod.fetchArrayK(getField("Money"))[nind]) - float(betO))))
		setField("NetG",keymod.editValueK(getField("NetG"), nind,(float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(betO))))
		setField("Last",keymod.editValueK(getField("Last"), nind, "(-$" + str(round(betO * 100) / 100) + ")"))
		print("Bet Placed")
		
		time.sleep(1)
		onR = ""
		onB = ""
		onG = ""
		while (int(60- (int(datetime.datetime.utcnow().strftime("%s"))%60)) > 1):
			gClear()
			now = datetime.datetime.utcnow()
			print("\nTime Left: " + str(int(59- (int(now.strftime("%s"))%60)))+"\n\n\n")
			onR = "\n"
			onB = "\n"
			onG = "\n"
			for x in range(0,len(keymod.fetchArrayK(getField("InRL")))):
				#gClear()
				#print(x)
				c = keymod.fetchArrayK(getField("TABRL"))
				cc = keymod.fetchArrayK(getField("MRL"))
				ccc = keymod.fetchArrayK(getField("InRL"))
				if(c[x] == "red"):
					onR += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*2)+")"
				if(c[x] == "blue"):
					onB += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*2)+")"
				if(c[x] == "gold"):
					onG += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*14)+")"
			print("On RED: (2x)"+ onR)
			print("\n\nOn BLUE: (2x)"+ onB)
			print("\n\nOn GOLD: (14x)"+ onG)
			time.sleep(0.5)
		
		m = []
		for jki in range(0,len(keymod.fetchArrayK(getField("InRL")))):
			if( keymod.fetchArrayK(getField("InRL"))[jki] != ""):
				m.append(keymod.fetchArrayK(getField("InRL"))[jki])
		#print(str(m)+"hello!!!")
		#time.sleep(2)

		if(m[0] == name):
			gClear()
			#print("ALPHA BUILD | "+name+" | "+str (keymod.fetchArrayK(getField("InRL"))[1])+"\n")
			rR = random.randint(1,15)
			#print(rR)
			print("Fetching result...")
			if( rR in [1,3,5,7,9,11,13]):
				setField("LastRL","red")
				#print("red")
				time.sleep(3)
				if(placO == "red"):
					global w1
					w1 = True
			elif( rR in [2,4,6,8,10,12,14]):
				setField("LastRL","blue")
				#print("blue")
				time.sleep(3)
				if(placO == "blue"):
					#global w1
					w1 = True
			else:
				setField("LastRL","gold")
				#print("gold")
				time.sleep(3)
				if(placO == "gold"):
					#global w1
					w1 = True
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			if(w1):
				print("\nYou won off of " + str(getField("LastRL")))
				if(str(getField("InRL")) == "gold"):
					
					setField("Money",keymod.editValueK(getField("Money"), nind,(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(betO*14))))
					setField("Last",keymod.editValueK(getField("Last"), nind, "(+$" + str(round(betO * 1400) / 100) + ")"))
					gClear()
					print("\nYou won off of " + str(getField("LastRL")))
					print("You win 14x your money because it was Gold! ($"+str(float(betO)*14)+")")
				else:
					
					setField("Money",keymod.editValueK(getField("Money"), nind,(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(betO*2))))
					setField("Last",keymod.editValueK(getField("Last"), nind, "(+$" + str(round(betO * 200) / 100) + ")"))
					gClear()
					print("\nYou won off of " + str(getField("LastRL")))
					print("You win 2x your money because it was Red/Blue ($"+str(float(betO)*2)+")")	
			else:
				print("\nThe result was "+getField("LastRL")+", you lost on "+keymod.fetchArrayK(getField("TABRL"))[nind]+".")
			setField("LastRL","")
		else:
			gClear()
			#print("BETA BUILD | "+name+" | "+str (keymod.fetchArrayK(getField("InRL"))[nind])+"\n")
			while(getField("LastRL") == ""):
				time.sleep(0.1)
			if(getField("LastRL") != "" and getField("LastRL") == placO):
				
				if(str(getField("LastRL")) == "gold"):
					
					setField("Money",keymod.editValueK(getField("Money"), nind,(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(betO*14))))
					setField("NetG",keymod.editValueK(getField("NetG"), nind,(float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(betO*14))))
					setField("Last",keymod.editValueK(getField("Last"), nind, "(+$" + str(round(betO * 1400) / 100) + ")"))
					gClear()
					print("\nYou won off of " + str(getField("LastRL"))+": You were also "+placO)
					print("You win 14x your money because it was Gold! ($"+str(float(betO)*14)+")")
				else:
					setField("Money",keymod.editValueK(getField("Money"), nind,(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(betO*2))))
					setField("NetG",keymod.editValueK(getField("NetG"), nind,(float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(betO*2))))
					setField("Last",keymod.editValueK(getField("Last"), nind, "(+$" + str(round(betO * 200) / 100) + ")"))
					gClear()
					print("\nYou won off of " + str(getField("LastRL"))+": You were also "+placO)
					print("You win 2x your money because it was Red/Blue ($"+str(float(betO)*2)+")")
			elif(getField("LastRL") != ""):
				print("\nThe result was "+getField("LastRL")+", you lost on "+keymod.fetchArrayK(getField("TABRL"))[nind]+".")
		print("\nYour balance will update upon returning to menu\n\nInput To Return to Menu")
		#print(str(m)+"hello!!!")

		input()
		w1 = False
		setField("InRL",keymod.editValueK(getField("InRL"),nind,""))
		setField("TABRL",keymod.editValueK(getField("TABRL"),nind,""))
		setField("MRL",keymod.editValueK(getField("MRL"),nind,""))
		mU()
	except Exception as e:
		replit.clear()
		print("Unexpected error, returning to menu after input.\n\n\nError:\n   "+str(e))
		setField("InRL",keymod.editValueK(getField("InRL"),nind,""))
		setField("TABRL",keymod.editValueK(getField("TABRL"),nind,""))
		setField("MRL",keymod.editValueK(getField("MRL"),nind,""))
		input()
		mU()
def wrL():
	#time.sleep(1)
	onR = ""
	onB = ""
	onG = ""
	while (int(60- (int(datetime.datetime.utcnow().strftime("%s"))%60)) > 1):
		gClear()
		now = datetime.datetime.utcnow()
		print("\nTime Left: " + str(int(59- (int(now.strftime("%s"))%60)))+"\n\n\n")
		onR = "\n"
		onB = "\n"
		onG = "\n"
		for x in range(0,len(keymod.fetchArrayK(getField("InRL")))):
			#gClear()
			#print(x)
			c = keymod.fetchArrayK(getField("TABRL"))
			cc = keymod.fetchArrayK(getField("MRL"))
			ccc = keymod.fetchArrayK(getField("InRL"))
			if(c[x] == "red"):
				onR += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*2)+")"
				if(c[x] == "blue"):
					onB += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*2)+")"
				if(c[x] == "gold"):
					onG += "\n  "+str(ccc[x].upper()) + ": $" + str(cc[x]) + " ($" + str(float(cc[x])*14)+")"
		print("On RED: (2x)"+ onR)
		print("\n\nOn BLUE: (2x)"+ onB)
		print("\n\nOn GOLD: (14x)"+ onG)
		time.sleep(0.5)
	
	gClear()
	print("Fetching...")
	tTW = 10 * 5
	lK = ""
	while(getField("LastRL") == ""):
		time.sleep(0.1)
		tTW -= 1
		if(tTW < 0 and getField("LastRL") == ""):
			lK = "\nNo players, so no outcome"
			break

	sys.stdout.write('\x1b[1A')
	sys.stdout.write('\x1b[2K')
	print(lK)
	if(getField("LastRL") != ""):
		print("Result was "+str(getField("LastRL")))
	print("\nInput Y in order to continue spectating")
	print("Input anything else to return to menu")
	if(input().lower() == 'y'):
		wrL()
	else:
		mU()
def bLMG():
	gClear()
	print("\n1 for Create Landmine\n2 for Join Landmine")
	i = input()
	if(i == '1'):
		cLMG("")
	elif(i == '2'):
		jLMG()
	else:
		mU()
		return
def cLMG(pin):
	try:
		gClear()
		print()
		if(pin == ""):
			print("Do you wish to host a Landmines? (y/n)")
			in_1 = input().lower()
			if(in_1 == 'y'):
				pass
			elif(in_1 == 'n'):
				mU()
				return
			else:
				cLMG("")
				return
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')

		print("What do you wish to bet?")
		mon_in = float(input())
		if(mon_in < 0.01 or mon_in > float(keymod.fetchArrayK(getField("Money") )[nind] ) ):
			cLMG("pass")
			return
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')

		print("Your Landmines is being created.")
		k = len(keymod.fetchArrayK(getField("LandPlay")))
		local_map = arrmod.newF(5,5)
		str_local_map = arrmod.arr2str(local_map,"+")

		#print(str_local_map)
		setField("LandMap",keymod.addStringK(getField("LandMap"),str_local_map))
		setField("LandPlay",keymod.addStringK(getField("LandPlay"),name))
		setField("LandPlay2",keymod.addStringK(getField("LandPlay2"),""))
		setField("LandBet",keymod.addStringK(getField("LandBet"),mon_in))
		setField("LandTurn",keymod.addStringK(getField("LandTurn"),name))
		setField("Money",keymod.editValueK(
							getField("Money"), nind,
							(float(keymod.fetchArrayK(getField("Money"))[nind]) - float(mon_in))))
		setField("NetG",keymod.editValueK(
							getField("NetG"), nind,
							(float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(mon_in))))
		setField("Last",keymod.editValueK(
							getField("Last"), nind, "(-$" + str(round(mon_in * 100) / 100) + ")"))

		gClear()
		print("Your join code: " + str(k) + "\n")
		arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
		USEL_N1 = 120
		while( keymod.fetchArrayK(getField("LandPlay2"))[k] == "" ):
			time.sleep(1)
			print("Waiting for opponent" + "."*random.randint(0,4))
			sys.stdout.write('\x1b[1A')
			sys.stdout.write('\x1b[2K')
			USEL_N1 -= 1
			if(USEL_N1 < 0):
				raise(ValueError)
		
		gClear()
		print("Opponent found!")
		def turn():
			gClear()
			if( keymod.fetchArrayK(getField("LandTurn"))[k] == name ):
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("\nYour move. \nX: ")
				#0,1,2,3,4
				yy = cN(int(input())-1,0,4)
				print("Y: ")
				xx = cN(int(input())-1,0,4)
				map_l = arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+")
				if(map_l[xx][yy] in [2,3]):
					turn()
					return
				else:
					if(map_l[xx][yy] == 0):
						map_l[xx][yy] = 2
					else:
						map_l[xx][yy] = 3
						setField("LandTurn",keymod.editValueK(getField("LandTurn"),k,"789guestwin"))
						setField("LandMap",keymod.editValueK(getField("LandMap"),k,arrmod.arr2str(map_l,"+")))
						turn()
						return
					setField("LandMap",keymod.editValueK(getField("LandMap"),k,arrmod.arr2str(map_l,"+")))
					e_name = keymod.fetchValueK(getField("LandPlay2"),k)
					setField("LandTurn",keymod.editValueK(getField("LandTurn"),k,e_name ))
					turn()
					return
			elif(keymod.fetchArrayK(getField("LandTurn"))[k] == "789hostwin"):
				setField("Money",keymod.editValueK(
							getField("Money"), nind,
							(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(mon_in*2))))
				setField("NetG",keymod.editValueK(
							getField("NetG"), nind,
							(float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(mon_in*2))))
				setField("Last",keymod.editValueK(
							getField("Last"), nind, "(+$" + str(round(mon_in * 200) / 100) + ")"))
				gClear()
				print()
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("You Won!\n\nReturning to menu in 3 seconds")

				time.sleep(3)
				setField("LandMap",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandMap")),k)) )
				setField("LandPlay",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay")),k)) )
				setField("LandPlay2",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay2")),k)) )
				setField("LandTurn",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandTurn")),k)) )
				setField("LandBet",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandBet")),k)) )
				mU()
			elif(keymod.fetchArrayK(getField("LandTurn"))[k] == "789guestwin"):
				print()
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("You Lost.\n\nReturning to menu in 3 seconds")

				time.sleep(3)
				setField("LandMap",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandMap")),k)) )
				setField("LandPlay",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay")),k)) )
				setField("LandPlay2",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay2")),k)) )
				setField("LandTurn",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandTurn")),k)) )
				setField("LandBet",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandBet")),k)) )
				mU()
			else:
				print("Waiting for Opponent ("+str(keymod.fetchValueK(getField("LandPlay2"),k))+") move...")
				time.sleep(1)
				sys.stdout.write('\x1b[1A')
				sys.stdout.write('\x1b[2K')
				turn()
				return
		turn()

		#setField("field",keymod.editValueK(getField("field"), index, value)

		input()
		mU()
	except Exception as newE:
		setField("Money",keymod.editValueK(
            getField("Money"), nind,
            (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(round(float(keymod.fetchArrayK(getField("LandBet"))[k]) *100)/100))))
		print("Unexpected error. \nBalance will be refunded from current activity.\n\nWait 3 seconds and Input to return to menu\n\n\n\n\n")
		print(newE)
		setField("LandMap",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandMap")),k)) )
		setField("LandPlay",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay")),k)) )
		setField("LandPlay2",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandPlay2")),k)) )
		setField("LandTurn",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandTurn")),k)) )
		time.sleep(3)
		setField("LandBet",keymod.intoStringK(keymod.removeValueK(keymod.fetchArrayK(getField("LandBet")),k)) )
		input()
		mU()
def jLMG():
	try:
		gClear()
		print("\nJoin Code:")
		k = int(input())
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')
		try:
			if(keymod.fetchArrayK(getField("LandPlay2"))[k] != "" or k == 0):
				print("Game in progress\n\nReturning to menu after input")
				input()
				mU()
				return
		except Exception:
			gClear()
			print("\nGame does not exist.\n\nReturning to menu after input")
			input()
			mU()
			return


		mon_in = float(keymod.fetchArrayK(getField("LandBet"))[k])
		mon_in = round(mon_in*100)/100
		if(mon_in > float(keymod.fetchArrayK(getField("Money"))[nind]) ):
			print("You cannot afford to join this.\n\nReturning to menu after input")
			input()
			mU()
			return
		print("Entry fee is $"+str(mon_in)+", (y/n) to proceed.")
		rand_in = input().lower()
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')
		sys.stdout.write('\x1b[1A')
		sys.stdout.write('\x1b[2K')

		if(rand_in == 'y'):
			pass
		else:
			mU()
			return
		try:
			if(keymod.fetchArrayK(getField("LandPlay2"))[k] != ""):
				print("Game in progress\n\nReturning to menu after input")
				input()
				mU()
				return
		except Exception:
			gClear()
			print("\nGame does not exist.\n\nReturning to menu after input")
			input()
			mU()
			return
		setField("Money",keymod.editValueK(
							getField("Money"), nind,
							(float(keymod.fetchArrayK(getField("Money"))[nind]) - float(mon_in))))
		setField("NetG",keymod.editValueK(
							getField("NetG"), nind,
							(float(keymod.fetchArrayK(getField("NetG"))[nind]) - float(mon_in))))
		setField("Last",keymod.editValueK(
							getField("Last"), nind, "(-$" + str(round(mon_in * 100) / 100) + ")"))
		setField("LandPlay2",keymod.editValueK(getField("LandPlay2"),k,name ))
		def turn():
			gClear()
			if( keymod.fetchArrayK(getField("LandTurn"))[k] == name ):
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("\nYour move. \nX: ")
				yy = cN(int(input())-1,0,5)
				print("Y: ")
				xx = cN(int(input())-1,0,5)
				map_l = arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+")
				if(map_l[xx][yy] in [2,3]):
					turn()
					return
				else:
					if(map_l[xx][yy] == 0):
						map_l[xx][yy] = 2
					else:
						map_l[xx][yy] = 3
						setField("LandTurn",keymod.editValueK(getField("LandTurn"),k,"789hostwin"))
						setField("LandMap",keymod.editValueK(getField("LandMap"),k,arrmod.arr2str(map_l,"+")))
						turn()
						return
					setField("LandMap",keymod.editValueK(getField("LandMap"),k,arrmod.arr2str(map_l,"+")))
					e_name = keymod.fetchValueK(getField("LandPlay"),k)
					setField("LandTurn",keymod.editValueK(getField("LandTurn"),k,e_name ))
					turn()
					return
			elif(keymod.fetchArrayK(getField("LandTurn"))[k] == "789hostwin"):
				print()
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("\nYou Lost.\n\nInput to return to menu")
				input()
				mU()
			elif(keymod.fetchArrayK(getField("LandTurn"))[k] == "789guestwin"):
				mon_in = float(keymod.fetchArrayK(getField("LandBet"))[k])
				setField("Money",keymod.editValueK(
							getField("Money"), nind,
							(float(keymod.fetchArrayK(getField("Money"))[nind]) + float(mon_in*2))))
				setField("NetG",keymod.editValueK(
							getField("NetG"), nind,
							(float(keymod.fetchArrayK(getField("NetG"))[nind]) + float(mon_in*2))))
				setField("Last",keymod.editValueK(
							getField("Last"), nind, "(+$" + str(round(mon_in * 200) / 100) + ")"))
				gClear()
				print()
				arrmod.render( arrmod.str2arr(keymod.fetchArrayK(getField("LandMap"))[k],"+"))
				print("\nYou Won!\n\nInput to return to menu")
				input()
				mU()
			else:
				print("Waiting for Opponent ("+str(keymod.fetchValueK(getField("LandPlay"),k))+") move...")
				time.sleep(1)
				sys.stdout.write('\x1b[1A')
				sys.stdout.write('\x1b[2K')
				turn()
				return
		turn()
	except Exception as newE:
		setField("Money",keymod.editValueK(
            getField("Money"), nind,
            (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(round(float(keymod.fetchArrayK(getField("LandBet"))[k]) *100)/100))))
		print("Unexpected error. \nBalance will be refunded from current activity.\n\nInput to return to menu\n\n\n\n\n")
		print(newE)
		input()
		mU()

def depM():
    try:
        gClear()
        print("E to exit\n\nHow much do you wish to deposit?")
        i = input()
        try:
            if (i.lower() == 'e'):
                mU()
                return
            elif (round(float(i) * 100) / 100 >= 0.01):
                gClear()
                i = round(float(i) * 100) / 100
                print(
                    "\nYou will deposit $" + str(i) +
                    ".\n\nEnter Y to finalize transaction.\nEnter anything else to return to menu."
                )
                if (input().lower() == 'y'):
                    setField("Money",keymod.editValueK(getField("Money"), nind, (float(
                        keymod.fetchArrayK(getField("Money"))[nind]) + float(i))))
                    gClear()
                    print("\nAdded $" + str(i) +
                          ".\nThis will not affect 'Last Transaction'.")
                    time.sleep(4)
                    mU()
                else:
                    mU()
            else:
                gClear()
                print("\nMust be E or $")
                time.sleep(3)
                mU()
        except (TypeError, ValueError):
            #except (TypeError, ValueError) as e:
            gClear()
            print("\nMust be E or a numeric value.")
            #print(e)
            time.sleep(3)
            mU()
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def withM():
    try:
        gClear()
        print("E to exit\n\nHow much do you wish to withdraw?")
        i = input()
        try:
            if (i.lower() == 'e'):
                mU()
                return
            elif (round(float(i) * 100) / 100 >= 0.01
                  and round(float(i) * 100) / 100 <= float(
                      keymod.fetchArrayK(getField("Money"))[nind])):
                gClear()
                i = round(float(i) * 100) / 100
                print(
                    "\nYou will withdraw $" + str(i) +
                    ".\n\nEnter Y to finalize transaction.\nEnter anything else to return to menu."
                )
                if (input().lower() == 'y'):
                    setField("Money",keymod.editValueK(getField("Money"), nind, (float(
                        keymod.fetchArrayK(getField("Money"))[nind]) - float(i))))
                    gClear()
                    print("\nWithdrew $" + str(i) +
                          ".\nThis will not affect 'Last Transaction'.")
                    time.sleep(4)
                    mU()
                else:
                    mU()
            elif ((round(float(i) * 100) / 100) > float(
                    keymod.fetchArrayK(getField("Money"))[nind])):
                gClear()
                print("\nCannot withdraw more than balance.")
                time.sleep(3)
                mU()
            else:
                gClear()
                print("\nMust be E or $")
                time.sleep(3)
                mU()
        except (TypeError, ValueError):
            #except (TypeError, ValueError) as e:
            gClear()
            print("\nMust be E or a numeric value.")
            #print(e)
            time.sleep(3)
            mU()
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def codeM():
    try:
        gClear()
        print("E to exit\n\n")
        if (keymod.fetchValueK(getField("Code"), nind) == ""):
            print("Are you using a: \n\n1: Referral code\n2: Balance code")
            i = input().lower()
            if (i == '1'):
                gClear()
                print("\n\nReferral Code:")
                xi = input().lower()
                if (xi in keymod.fetchArrayK(getField("RCO"))):
                    gClear()
                    xii = keymod.fetchArrayK(getField("RCO")).index(xi)
                    print("\nDone!\n\n\nReturning to menu after input")
                    setField("Code",keymod.editValueK(getField("Code"), nind, xi))
                    setField("RCOE",keymod.editValueK(
                        getField("RCOE"), xii,
                        str(int(keymod.fetchValueK(getField("RCOE"), xii)) + 1)))
                    input()
                    mU()
                else:
                    gClear()
                    print("\nNot a valid code.\n\n\nInput to return to menu")
                    input()
                    mU()
            elif (i == '2'):
                gClear()
                print("\nCode: (Use PLUS5 if you don't have one)")
                nc = input().lower()
                if (nc in keymod.fetchArrayK(getField("FCO"))):
                    nino = keymod.fetchArrayK(getField("FCO")).index(nc)
                    setField("Code",keymod.editValueK(getField("Code"), nind, nc))
                    setField("Money",keymod.editValueK(
                        getField("Money"), nind,
                        (float(keymod.fetchArrayK(getField("Money"))[nind]) + float(
                            keymod.fetchValueK(getField("FCOE"), nino)))))
                    gClear()
                    print("\nDone!")
                    time.sleep(3)
                    mU()
                else:
                    gClear()
                    print("\nNot a valid code.")
                    time.sleep(3)
                    mU()
            else:
                gClear()
                print("\nMust be 1 or 2.\n\nReturning to menu after input")
                input()
                mU()
        else:
            gClear()
            print("\nYou already entered a code. (" +
                  keymod.fetchValueK(getField("Code"), nind).upper() +
                  ")\n\n\nReturning to menu after input")
            input()
            mU()
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()
def affiM():
    try:
        if (name in keymod.fetchArrayK(getField("RCO"))):
            gClear()
            xi = keymod.fetchArrayK(getField("RCO")).index(name)
            print(
                "\nYou are an affiliate, " + name.upper() +
                "\n\nReferral Code: " + name.upper() + "\nNumber of Users: " +
                keymod.fetchValueK(getField("RCOE"), xi) + "\n(+$" +
                str(float(keymod.fetchValueK(getField("RCOE"), xi)) * 0.01) +
                "*Cashout extra per 3.5x+ crash\nwith $0.5 or higher bet)\n\n\nReturning to menu after input"
            )
            input()
        else:
            gClear()
            print(
                "\nYou are not an affiliate. \nTo register, you must: \n\n-$150.00+ in your account\n-Request to register\n-Be willing to pay $0.05\n\n\n"
            )
            if (float(keymod.fetchArrayK(getField("Money"))[nind]) >= 150):
                print(
                    "Would you like to register? (Y + $0.05)\nOtherwise, input to return to menu"
                )
                newi = input().lower()
                if (newi == 'y'):
                    gClear()
                    print("\nCreating...")
                    setField("Money",keymod.editValueK(
                        getField("Money"), nind,
                        (float(keymod.fetchArrayK(getField("Money"))[nind]) - 0.05)))
                    setField("RCO",keymod.addStringK(getField("RCO"), str(name)))
                    setField("RCOE",keymod.addStringK(getField("RCOE"), "0"))
                    time.sleep(3)
                    print(
                        "\n\n\nSuccess!\nThis will not affect 'Last Transaction'\n\nReturning to menu after input"
                    )
                    input()
                    mU()
                else:
                    mU()
            else:
                print(
                    "You are currently inelligible to register.\nReturning to menu after input"
                )
                input()
                mU()
        mU()
    except Exception as e:
        replit.clear()
        print("Unexpected error\nInput to return to menu.")
        print("\n\n\n\nError: " + str(e))
        input()
        mU()

def mU():
    gClear()
    print(
        "U for Account Management\n\n1 for Odds\n2 for Coinflip\n3 for Crash\n4 for Statistics\n\n5 for Deposit\n6 for Withdraw\n7 for Code\n8 for Affiliate\n\n9 for Roulette\n10 for Landmines"
    )
    i = str(nInput())
    if (i == "1"):
        bA()
    elif (i == "2"):
        cO()
    elif (i == "3"):
        cG()
    elif (i == "4"):
        sB()
    elif (i == "5"):
        depM()
    elif (i == "6"):
        withM()
    elif (i == "7"):
        codeM()
    elif (i == "8"):
        affiM()
    elif (i == "9"):
        bRl()
    elif (i == "10"):
        bLMG()
    else:
        mU()
    return
def gT(l):
    print("threadcasino\n\n")
    if (l != 0):
        for i in range(0, l):
            print("Starting")
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            time.sleep(0.5)
            print("Starting.")
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            time.sleep(0.5)
            print("Starting..")
            time.sleep(0.5)
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            time.sleep(0.5)
            print("Starting...")
            sys.stdout.write('\x1b[1A')
            sys.stdout.write('\x1b[2K')
            time.sleep(0.5)
    uI()
    mU()
    print("EXIT")
    time.sleep(10)

try:
	gT(0)
except RecursionError:
	print("Max Recursion Length Reached. \nRestart Program to Continue.")


#                               John W
