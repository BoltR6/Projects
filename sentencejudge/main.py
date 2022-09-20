##____ JW ____##
#|before me and my friends messed it up
#|____________##

#Imports
import requests;
import sys;

#Fuctions
def classify(text):
    key = "REMOVED FOR SECURITY"
    url = "https://machinelearningforkids.co.uk/api/scratch/"+ key + "/classify"

    response = requests.get(url, params={ "data" : text })

    if response.ok:
        responseData = response.json()
        topMatch = responseData[0]
        return topMatch
    else:
        response.raise_for_status()

#Variables
incorrect = [];
incorrect_answer = [];
cuss = False;

#Initialization Rn
print ("");
print ("Program starting.\n ")

#Temp
person_cuss_input = input("Count cusses as bad? ");


#Setup
if(person_cuss_input.upper() == 'Y' or person_cuss_input.upper() == 'YES' or person_cuss_input.upper() == 'YEAH' or person_cuss_input.upper() == 'SURE'):
    cuss = True;
    print(" Cusses are blocked.")

#Draw
while True:

  printed = False;
  cur_num = 0;
  temp_block = False;

  

  print ("_________________");
  person_input_1 = input("Say something! ");
  person_output = classify(person_input_1.upper()+".");
  for index in range(len(incorrect)):
    if(person_input_1 == incorrect[index]):
      print (" Correct answer: ",incorrect_answer[index],"\n I am 100% sure of this.")
      printed = True;
      cur_num = index;
    
    
  if(not printed):
    print ("  Classified as: %s.\n  I am %d%% sure of this." % (person_output["class_name"], person_output["confidence"]))
  if(person_output["class_name"] == 'Bad' or (person_output["class_name"] == 'Cuss' and cuss == True)):
    print(" This would be blocked.")
  else:
    print(" This would be let through.")
  
  person_input_2 = input("Is this correct? ");

  if (person_input_2.upper() == 'NO'):
    if(not printed):
      incorrect.append(person_input_1)
      incorrect_answer.append(input("Correct answer: "))
    else:
      incorrect_answer[cur_num]  = input("Replace past answer with: ")
    print ("Thank you for your input.\nSay 'end' to exit Python and return incorrect results.");
  
  person_input_3 = input("Contine? ")

  if (person_input_3.upper() == 'END' or person_input_3.upper() == 'NO'):
    print ("Program ending. \n\nIncorrect results:")
    for index in range(len(incorrect)):
      print ("Input: ", incorrect[index])
      print( " Correct response: ", incorrect_answer[index])
      print("_________________")
    sys.exit();
  print ("")
