# Justification SSE pour web temps réel

## Contexte du projet

Dans le cadre de du projet, il fallait implémenter un dashboard financier avec des **métriques temps réel**. Il fallait choisir la technique la plus adaptée pour ça avec MongoDB.

## Comparaison des solutions techniques
 Polling: Inefficace, car trop de ressources consommées et latence élevée.
WebSocket: Trop complexe pour un dashboard simple, la bidirectionnalité est inutile, et il faudrait gérer les reconnexions.
Server-Sent Events (SSE): Optimal pour un dashboard en read-only, donc unidirectionnel car limité au push du server vers le client, simple à implémenter, reconnexion automatique.

Les dashboards financiers sont typiquement **read-only** côté client avec des **updates fréquents** côté serveur. SSE est donc la solution idéale.
