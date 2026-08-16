# Backwards Testing Rule for 11agi and 11ops skills

when managing anything (creating, refactoring, updating, migrating, renaming, deleting), always backwards test against the previous version before calling the change done. guarantee nothing breaks and nothing is lost:

- diff old vs new: every skill, file, and behavior from the previous version is accounted for (moved, replaced, or deliberately dropped and noted)
- run the repo's validators on the result (e.g. npm run validate-skills, npm run pack-dry)
- when something consumes the changed thing (npm package, plugin marketplace, another repo, a published site), check the change against how it is consumed
- report the backwards test result to the operator, listing what was verified
- never run destructive or dangerous actions such as the cleanup skills
