<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Carbon\Carbon;

class Pointage extends Model
{
    protected $connection = 'mongodb'; // Déclare que ce modèle utilise MongoDB

    protected $fillable = ['utilisateur_id', 'date', 'firstTime', 'secondTime', 'status'];
    

    // Définir la relation avec Utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Mutator pour définir automatiquement le statut avant de sauvegarder
     */
    protected static function booted()
    {
        static::saving(function ($pointage) {
            $pointage->status = $pointage->calculateStatus();
        });
    }

    /**
     * Calcule le statut basé sur les règles.
     */
    public function calculateStatus(): string
    {
        // Vérifie si le premier pointage (firstTime) est null
        if (is_null($this->firstTime)) {
            return 'Absent';
        }

        // Convertir l'heure en objet Carbon pour la comparaison
        $heureDebut = Carbon::parse($this->firstTime);
        $limiteRetard = Carbon::parse('08:00');

        // Vérifie si l'heure est avant ou après 08:00
        if ($heureDebut->lt($limiteRetard)) {
            return 'Présent';
        } else {
            return 'Retard';
        }
    }
}
