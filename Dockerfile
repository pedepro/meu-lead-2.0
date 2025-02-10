# Usa a imagem oficial do NGINX
FROM nginx:latest

# Remove a configuração padrão do NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do seu projeto para o diretório padrão do NGINX
COPY . /usr/share/nginx/html

# Expõe a porta 80 para acessar o site
EXPOSE 80

# Inicia o NGINX
CMD ["nginx", "-g", "daemon off;"]
