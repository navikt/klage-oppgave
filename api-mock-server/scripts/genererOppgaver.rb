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
                ytelse TEXT,
                hjemmel TEXT,
                frist TEXT
            )
            "
  rescue SQLite3::Exception => e

      puts "Exception occurred"
      puts e

  ensure
      db.close if db
  end
end

def insert_oppgave(id, type, ytelse, hjemmel, frist)
  begin
	  db = SQLite3::Database.open "../oppgaver.db"
      db.execute("INSERT INTO Oppgaver (Id, type, ytelse, hjemmel, frist) VALUES (?, ?, ?, ?, ?)",
                                        [id, type, ytelse, hjemmel, frist.to_s])

  rescue SQLite3::Exception => e
    puts "Exception occurred"
    puts e
    exit
  ensure
    db.close if db
  end
end


def tilfeldigYtelse()
  r = rand(3)
  if r == 0
    return "Sykepenger"
  end
  if r == 1
    return "Dagpenger"
  end
  if r == 2
    return "Foreldrepenger"
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
  ytelse = tilfeldigYtelse()
  frist = Faker::Date.backward(days: 14)
  hjemmel = nestenTilfeldigHjemmel()
  insert_oppgave(id, type, ytelse, hjemmel, frist)
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


