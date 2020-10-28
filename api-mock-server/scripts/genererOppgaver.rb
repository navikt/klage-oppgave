require 'json'
require 'faker'

def tilfeldigYtelse()
  r = rand(3)
  if r == 0
    return "SYK"
  end
  if r == 1
    return "DAG"
  end
  if r == 2
    return "FOR"
  end
end

def lagData()
  data = {
    'id' => Faker::Number.number(digits: 10),
    'bruker': {
      'fnr': Faker::Number.number(digits: 11),
      'navn': Faker::Name.name
    },
    "type": rand(2) == 1 ? "klage" : "anke",
    "ytelse": tilfeldigYtelse(),
    "hjemmel": "8-" << Faker::Number.number(digits: 2).to_s,
    "frist": Faker::Date.between(from: "2018-01-01", to: Date.today),
    "saksbehandler": {
      "ident": Faker::Internet.username(specifier: 6..8),
      "navn:": Faker::Movies::PrincessBride.character 
    }
  }
  return JSON[data]
end


file = File.open("../fixtures/oppgaver.json", "w")
i=0
file.write("[")
loop do
  file.write(lagData())
  file.write(",");
  i += 1;
  if i == 50
    file.write(lagData())
    break
  end
end
file.write("]")

