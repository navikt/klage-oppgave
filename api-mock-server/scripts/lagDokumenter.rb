# generer 51 tilfeldige oppgaver

require 'json'
require 'faker'
require 'sqlite3'

def init()
    begin
        db = SQLite3::Database.open ARGV[0]
        db.execute "DROP TABLE IF EXISTS Dokumenter"
        db.execute "DROP TABLE IF EXISTS Vedlegg"

        db.execute "CREATE TABLE Dokumenter
            (
            	journalpostId TEXT PRIMARY KEY,
            	dokumentInfoId TEXT,
            	tittel TEXT,
            	tema TEXT,
            	registrert TEXT,
            	harTilgangTilArkivvariant INTEGER,
            	valgt INTEGER
            )
            "
        db.execute "CREATE TABLE Vedlegg
            (
            	dokumentInfoId TEXT PRIMARY KEY,
            	tittel TEXT,
            	harTilgangTilArkivvariant INTEGER,
            	valgt INTEGER
            )
            "
  rescue SQLite3::Exception => e

      puts "Exception occurred"
      puts e

  ensure
      db.close if db
  end
end

def insert_dokument(journalpostId, dokumentInfoId, tittel, tema, registrert, harTilgangTilArkivvariant, valgt)
  begin
	  db = SQLite3::Database.open ARGV[0]
      db.execute("INSERT INTO Dokumenter (journalpostId, dokumentInfoId, tittel, tema, registrert, harTilgangTilArkivvariant, valgt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                        [journalpostId, dokumentInfoId, tittel, tema, registrert.to_s, harTilgangTilArkivvariant, valgt])

  rescue SQLite3::Exception => e
    puts "Exception occurred"
    puts e
    exit
  ensure
    db.close if db
  end
end

def insert_vedlegg(dokumentInfoId, tittel, harTilgangTilArkivvariant, valgt)
  begin
	  db = SQLite3::Database.open ARGV[0]
      db.execute("INSERT INTO Vedlegg (dokumentInfoId, tittel, harTilgangTilArkivvariant, valgt) VALUES (?, ?, ?, ?)",
                                        [dokumentInfoId, tittel, harTilgangTilArkivvariant, valgt])

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
  return "SYK"
end

def tilfeldigTrueFalse()
  return rand(2) == 1 ? 1 : 0
end

def lagDokument()
  journalpostId = Faker::Number.number(digits: 9)
  dokumentInfoId = Faker::Number.number(digits: 9)
  tittel = Faker::Book.title()
  tema = tilfeldigTema()
  registrert = Faker::Date.backward(days: 365)
  harTilgangTilArkivvariant = tilfeldigTrueFalse()
  valgt = tilfeldigTrueFalse()
  insert_dokument(journalpostId, dokumentInfoId, tittel, tema, registrert, harTilgangTilArkivvariant, valgt)
end

def lagVedlegg()
  journalpostId = Faker::Number.number(digits: 9)
  dokumentInfoId = Faker::Number.number(digits: 9)
  tittel = Faker::Marketing.buzzwords()
  tema = tilfeldigTema()
  registrert = Faker::Date.backward(days: 365)
  harTilgangTilArkivvariant = tilfeldigTrueFalse()
  valgt = tilfeldigTrueFalse()
  insert_vedlegg(dokumentInfoId, tittel,harTilgangTilArkivvariant, valgt)
end

init()

i=0

# trenger disse for test
insert_dokument("test_journalpostId", "test_dokumentInfoId", "test_tittel", "test_tema", "2020-12-31", 1,1)
insert_vedlegg("test_dokumentInfoId_2", "test_vedlegg_tittel", 1, 1)

loop do
  lagDokument()
  lagVedlegg()
  i += 1;
  if i == 500
    break
  end
end


