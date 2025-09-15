# Simple Dockerfile (dev-oriented)
FROM eclipse-temurin:17-jdk as build
WORKDIR /app
COPY pom.xml .
RUN ./mvnw -v || true
COPY src ./src
RUN ./mvnw -q -DskipTests package || mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
