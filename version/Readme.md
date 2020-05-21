The versioning system works upon checkout. It creates 
two files `version.txt` and `hash.txt` here 
and a file `version.js` in the directory of the static files.

In order for versioning to work you need:
- create a file in system git directory `.git/hooks/post-checkout`
- fill it with the following lines:
  ```
  #!/bin/bash
  exec version/post-checkout.hook
  ```
- make it executable (for Linux and Mac)
- make sure the repository has at least one tag vN.M