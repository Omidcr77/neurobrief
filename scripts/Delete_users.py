# delete_test_users.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys

def main():
    # Load MONGO_URI from your .env
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ Please set MONGO_URI in your .env file.")
        sys.exit(1)

    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client.get_default_database()  # Uses the DB name in the URI

    # Generate the list of test emails
    emails_to_delete = [f"test{i}@example.com" for i in range(1, 11)]

    # Perform the deletion
    result = db["users"].delete_many({ "email": { "$in": emails_to_delete } })

    print(f"✅ Deleted {result.deleted_count} user(s).")

if __name__ == "__main__":
    main()
