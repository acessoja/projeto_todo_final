<?php

namespace App\Http\Requests;

use App\Domain\Log\Entities\LogEntry;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Request de Validação: CreateLogRequest
 *
 * Responsável por validar os dados de entrada para criação de log.
 * A lógica de validação fica aqui — o controller recebe dados já limpos.
 *
 * Ao falhar a validação, retorna 422 com mensagens de erro em JSON,
 * sem lançar exceções HTML do Laravel padrão.
 */
class CreateLogRequest extends FormRequest
{
    /**
     * Qualquer requisição autenticada pode criar logs.
     * Ajustar quando autenticação for implementada.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $acoesPermitidas = implode(',', LogEntry::acoesPermitidas());

        return [
            'acao'      => ['required', 'string', "in:{$acoesPermitidas}"],
            'detalhe'   => ['required', 'string', 'max:1000'],
            'usuarioId' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        $acoesPermitidas = implode(', ', LogEntry::acoesPermitidas());

        return [
            'acao.required'    => 'O campo "acao" é obrigatório.',
            'acao.in'          => "O campo \"acao\" deve ser um dos valores: {$acoesPermitidas}.",
            'detalhe.required' => 'O campo "detalhe" é obrigatório.',
            'detalhe.max'      => 'O campo "detalhe" não pode ter mais de 1000 caracteres.',
            'usuarioId.integer' => 'O campo "usuarioId" deve ser um número inteiro.',
            'usuarioId.min'    => 'O campo "usuarioId" deve ser maior que zero.',
        ];
    }

    /**
     * Sobrescreve o comportamento padrão de falha para retornar JSON
     * em vez da resposta de redirect HTML do Laravel.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Dados inválidos.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
