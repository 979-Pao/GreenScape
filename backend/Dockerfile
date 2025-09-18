# --- build ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
# 👇 Limpia, empaqueta y reempaqueta como executable jar
RUN mvn -q -DskipTests clean package

# --- runtime ---
FROM eclipse-temurin:17-jre
WORKDIR /app
# 👇 copia el jar generado (no pongas comentarios al final de la línea COPY)
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
