# generer 51 tilfeldige oppgaver

require 'json'
require 'faker'
require 'sqlite3'

def init_oppgaver()
    begin
        db = SQLite3::Database.open "../oppgaver.db"
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
	  db = SQLite3::Database.open "../oppgaver.db"
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

def nestenTilfeldigSaksbehandler()
  return rand(15) <= 1 ?  "Z994488" : Faker::Internet.username(specifier: 6..8)
end

def nestenTilfeldigHjemmel()
  return "8-" + Faker::Number.number(digits: 2).to_s
end

def lagData()
  id = Faker::Number.number(digits: 7)
  type = rand(2) == 1 ? "klage" : "anke"
  tema = tilfeldigTema()
  frist = Faker::Date.backward(days: 365)
  mottatt = Faker::Date.backward(days: 365)
  hjemmel = nestenTilfeldigHjemmel()
  fnr = Faker::Number.number(digits: 11)
  navn = Faker::Movies::PrincessBride.character
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


