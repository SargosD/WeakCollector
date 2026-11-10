FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY .editorconfig Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY WeakCollector.Common/WeakCollector.Common.csproj WeakCollector.Common/
COPY WeakCollector.Messaging/WeakCollector.Messaging.csproj WeakCollector.Messaging/
COPY WeakCollector.Notifier/WeakCollector.Notifier.csproj WeakCollector.Notifier/
RUN dotnet restore WeakCollector.Notifier/WeakCollector.Notifier.csproj

COPY WeakCollector.Common/ WeakCollector.Common/
COPY WeakCollector.Messaging/ WeakCollector.Messaging/
COPY WeakCollector.Notifier/ WeakCollector.Notifier/
RUN dotnet publish WeakCollector.Notifier/WeakCollector.Notifier.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.Notifier.dll"]
