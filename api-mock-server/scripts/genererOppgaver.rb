# generer 51 tilfeldige oppgaver

require 'json'
require 'faker'
require 'sqlite3'

def init_oppgaver()
    begin
        db = SQLite3::Database.open ARGV[0]
        db.execute "DROP TABLE IF EXISTS Oppgaver"
        db.execute "CREATE TABLE Oppgaver
            (
            	Id INTEGER PRIMARY KEY,
		        type TEXT,
                tema TEXT,
                hjemmel TEXT,
                frist TEXT,
                mottatt TEXT,
                saksbehandler TEXT,
                fnr TEXT,
                navn TEXT,
                versjon INTEGER
            )
            "
  rescue SQLite3::Exception => e

      puts "Exception occurred"
      puts e

  ensure
      db.close if db
  end
end

def insert_oppgave(id, type, tema, hjemmel, frist, mottatt, saksbehandler, fnr, navn, versjon)
  begin
	  db = SQLite3::Database.open ARGV[0]
      db.execute("INSERT INTO Oppgaver (Id, type, tema, hjemmel, frist, mottatt, saksbehandler, fnr, navn, versjon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                        [id, type, tema, hjemmel, frist.to_s, mottatt.to_s, saksbehandler, fnr, navn, versjon])

  rescue SQLite3::Exception => e
    puts "Exception occurred"
    puts e
    exit
  ensure
    db.close if db
  end
end


def tilfeldigTema()
  r = rand(4)
  if r == 0
    return "43"
  end
  if r == 1
    return "30"
  end
  if r == 2
    return "56"
  end
  if r == 2
    return "7"
  end
end

def nestenTilfeldigSaksbehandler()
  return rand(15) <= 1 ?  "Z994488" : Faker::Internet.username(specifier: 6..8)
end

def tilfeldigHjemmel()
    kodeverk = JSON.parse(File.read(ARGV[1]))
    rndId = rand(0...kodeverk["hjemmel"].length-1)
    return kodeverk["hjemmel"][rndId]["id"];
end

def tilfeldigType()
    kodeverk = JSON.parse(File.read(ARGV[1]))
    return kodeverk["type"][rand(0...1)]["id"].to_s;
end

def lagData()
  id = Faker::Number.number(digits: 7)
  type = tilfeldigType()
  tema = tilfeldigTema()
  frist = Faker::Date.backward(days: 365)
  mottatt = Faker::Date.backward(days: 365)
  hjemmel = tilfeldigHjemmel()
  fnr = Faker::Number.number(digits: 11)
  navn = Faker::Movies::StarWars.character
  versjon = Faker::Number.number(digits: 2)
  insert_oppgave(id, type, tema, hjemmel, frist, mottatt, nestenTilfeldigSaksbehandler(), fnr, navn, versjon)
end

init_oppgaver()

i=0
loop do
  lagData()
  i += 1;
  if i == 500
    break
  end
end


