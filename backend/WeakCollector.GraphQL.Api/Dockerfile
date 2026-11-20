FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY .editorconfig Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY WeakCollector.Data/WeakCollector.Data.csproj WeakCollector.Data/
COPY WeakCollector.GraphQL.Api/WeakCollector.GraphQL.Api.csproj WeakCollector.GraphQL.Api/
RUN dotnet restore WeakCollector.GraphQL.Api/WeakCollector.GraphQL.Api.csproj

COPY WeakCollector.Data/ WeakCollector.Data/
COPY WeakCollector.GraphQL.Api/ WeakCollector.GraphQL.Api/
RUN dotnet publish WeakCollector.GraphQL.Api/WeakCollector.GraphQL.Api.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.GraphQL.Api.dll"]
