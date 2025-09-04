Cách để push lên bằng ssh
eval "$(ssh-agent -s)"        # khởi động ssh-agent
ssh-add ~/.ssh/id_ed25519_github_new
ssh-add -l
ssh -T git@github.com
git branch -M main
git push -u origin main