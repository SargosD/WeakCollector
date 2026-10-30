FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY src/WeakCollector.Contracts/WeakCollector.Contracts.csproj src/WeakCollector.Contracts/
COPY src/WeakCollector.Notifier/WeakCollector.Notifier.csproj src/WeakCollector.Notifier/
RUN dotnet restore src/WeakCollector.Notifier/WeakCollector.Notifier.csproj

COPY src/WeakCollector.Contracts/ src/WeakCollector.Contracts/
COPY src/WeakCollector.Notifier/ src/WeakCollector.Notifier/
RUN dotnet publish src/WeakCollector.Notifier/WeakCollector.Notifier.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.Notifier.dll"]
